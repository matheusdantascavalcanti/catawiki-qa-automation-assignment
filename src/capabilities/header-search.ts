import { expect, type Page } from '@playwright/test';

import type { NetworkDiagnostics } from '../diagnostics/network-diagnostics.js';

const SEARCH_NAME = 'Search for brand, model, artist...';

export class HeaderSearch {
  constructor(
    private readonly page: Page,
    private readonly diagnostics: NetworkDiagnostics,
  ) {}

  async open(): Promise<void> {
    await this.withTargetAccessCheck(async () => {
      await this.page.goto('/en/', { waitUntil: 'domcontentloaded' });
    });

    await expect(this.page).toHaveURL(
      (url) =>
        url.hostname === 'www.catawiki.com' && /^\/en\/?$/.test(url.pathname),
    );
    await this.ensureSearchReady();
  }

  async searchFor(query: string): Promise<void> {
    await this.ensureSearchReady();
    const searchInput = this.page.getByRole('combobox', {
      name: SEARCH_NAME,
      exact: true,
    });

    await searchInput.fill(query);
    await this.withTargetAccessCheck(async () => {
      await Promise.all([
        this.page.waitForURL(
          (url) =>
            url.pathname === '/en/s' && url.searchParams.get('q') === query,
        ),
        this.page.getByRole('button', { name: 'Search', exact: true }).click(),
      ]);
    });
  }

  private async ensureSearchReady(): Promise<void> {
    const searchInput = this.page.getByRole('combobox', {
      name: SEARCH_NAME,
      exact: true,
    });

    if (!(await searchInput.isVisible())) {
      const obstructionAction = this.page
        .getByRole('button', {
          name: /^(Accept all(?: cookies)?|Continue in English)$/i,
        })
        .first();

      if (await obstructionAction.isVisible()) {
        await obstructionAction.click();
      }
    }

    await expect(searchInput).toBeVisible();
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
