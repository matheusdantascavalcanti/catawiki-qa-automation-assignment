import { expect, type Page } from '@playwright/test';

import type { NetworkDiagnostics } from '../diagnostics/network-diagnostics.js';
import { readKnownConsentInteractionCount } from '../support/known-consent-interactions.js';

const SEARCH_NAME = 'Search for brand, model, artist...';
const SEARCH_READY_TIMEOUT_MS = 10_000;

export type SearchSubmission = 'button' | 'enter';

export class HeaderSearch {
  constructor(
    private readonly page: Page,
    private readonly diagnostics: NetworkDiagnostics,
  ) {}

  async open(): Promise<void> {
    await this.withTargetAccessCheck(async () => {
      await this.page.goto('/en/', { waitUntil: 'domcontentloaded' });
    });

    await expect(this.page).toHaveURL(/^https:\/\/www\.catawiki\.com\/en\/?$/);
    await this.ensureSearchReady();
  }

  async searchFor(
    query: string,
    options: { submitWith?: SearchSubmission } = {},
  ): Promise<void> {
    await this.ensureSearchReady();
    const searchInput = this.page.getByRole('combobox', {
      name: SEARCH_NAME,
      exact: true,
    });
    const submitWith = options.submitWith ?? 'button';

    await searchInput.fill(query);
    await this.withTargetAccessCheck(async () => {
      await Promise.all([
        this.page.waitForURL(
          (url) =>
            url.pathname === '/en/s' && url.searchParams.get('q') === query,
          { waitUntil: 'domcontentloaded' },
        ),
        submitWith === 'enter'
          ? searchInput.press('Enter', { noWaitAfter: true })
          : this.submitWithSearchButton(query),
      ]);
    });
  }

  async expectAccessible(): Promise<void> {
    await this.ensureSearchReady();
    await expect(
      this.page.getByRole('combobox', {
        name: SEARCH_NAME,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: 'Search', exact: true }),
    ).toBeVisible();
  }

  private async ensureSearchReady(): Promise<void> {
    const searchInput = this.page.getByRole('combobox', {
      name: SEARCH_NAME,
      exact: true,
    });
    const consentInteractionsBeforeReadiness = readKnownConsentInteractionCount(
      this.page,
    );

    if (!(await searchInput.isVisible())) {
      await this.openCompactSearchIfPresent();
    }

    try {
      await expect(searchInput).toBeVisible({
        timeout: SEARCH_READY_TIMEOUT_MS,
      });
    } catch (error) {
      if (
        !(await this.wasCompactSearchCollapsedAfterKnownConsent(
          consentInteractionsBeforeReadiness,
        ))
      ) {
        throw error;
      }

      await this.openCompactSearchIfPresent();
      await expect(searchInput).toBeVisible({
        timeout: SEARCH_READY_TIMEOUT_MS,
      });
    }
  }

  private async submitWithSearchButton(query: string): Promise<void> {
    const consentInteractionsBeforeSubmission =
      readKnownConsentInteractionCount(this.page);

    try {
      await this.clickSearchButton();
    } catch (error) {
      if (
        !(await this.canRecoverCollapsedCompactSearch(
          query,
          consentInteractionsBeforeSubmission,
        ))
      ) {
        throw error;
      }

      await this.ensureSearchReady();
      const searchInput = this.page.getByRole('combobox', {
        name: SEARCH_NAME,
        exact: true,
      });

      if ((await searchInput.inputValue()) !== query) {
        await searchInput.fill(query);
      }

      await this.clickSearchButton();
    }
  }

  private async canRecoverCollapsedCompactSearch(
    query: string,
    consentInteractionsBeforeSubmission: number,
  ): Promise<boolean> {
    if (this.isAtSearchResultsFor(query)) {
      return false;
    }

    return this.wasCompactSearchCollapsedAfterKnownConsent(
      consentInteractionsBeforeSubmission,
    );
  }

  private async wasCompactSearchCollapsedAfterKnownConsent(
    consentInteractionsBeforeAction: number,
  ): Promise<boolean> {
    if (
      readKnownConsentInteractionCount(this.page) <=
      consentInteractionsBeforeAction
    ) {
      return false;
    }

    const searchInput = this.page.getByRole('combobox', {
      name: SEARCH_NAME,
      exact: true,
    });

    return (
      !(await searchInput.isVisible()) &&
      (await this.readCompactSearchOpenerCount()) === 1
    );
  }

  private isAtSearchResultsFor(query: string): boolean {
    const url = new URL(this.page.url());

    return url.pathname === '/en/s' && url.searchParams.get('q') === query;
  }

  private async clickSearchButton(): Promise<void> {
    const searchButton = this.page.getByRole('button', {
      name: 'Search',
      exact: true,
    });

    await searchButton.click({ noWaitAfter: true });
  }

  private async openCompactSearchIfPresent(): Promise<void> {
    // The compact header opener currently has no accessible name. Keep this
    // observed, descriptive product selector private to the capability.
    const compactSearchOpener = this.page.locator(
      'button.c-header__mobile-nav__search:visible',
    );
    const openerCount = await this.readCompactSearchOpenerCount();

    if (openerCount > 1) {
      throw new Error(
        `Expected at most one compact search opener, received ${openerCount}.`,
      );
    }

    if (openerCount === 1) {
      await compactSearchOpener.click();
    }
  }

  private async readCompactSearchOpenerCount(): Promise<number> {
    return this.page
      .locator('button.c-header__mobile-nav__search:visible')
      .count();
  }

  private async withTargetAccessCheck(
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      this.diagnostics.throwIfTargetAccessFailed();
      throw error;
    }

    this.diagnostics.throwIfTargetAccessFailed();
  }
}
