import { expect, type Page } from '@playwright/test';

import type { NetworkDiagnostics } from '../diagnostics/network-diagnostics.js';

const SEARCH_NAME = 'Search for brand, model, artist...';

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
          : this.clickSearchButton(),
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

    if (!(await searchInput.isVisible())) {
      await this.openCompactSearchIfPresent();
    }

    await expect(searchInput).toBeVisible();
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
    const openerCount = await compactSearchOpener.count();

    if (openerCount > 1) {
      throw new Error(
        `Expected at most one compact search opener, received ${openerCount}.`,
      );
    }

    if (openerCount === 1) {
      await compactSearchOpener.click();
    }
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
