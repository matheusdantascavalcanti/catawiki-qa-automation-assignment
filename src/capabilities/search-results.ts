import { expect, type Locator, type Page } from '@playwright/test';

import type { NetworkDiagnostics } from '../diagnostics/network-diagnostics.js';
import {
  createObservedLot,
  type ObservedLot,
  readLotId,
} from '../domain/observed-lot.js';

interface VisibleLotEntry {
  link: Locator;
  observation: ObservedLot;
}

export class SearchResults {
  constructor(
    private readonly page: Page,
    private readonly diagnostics: NetworkDiagnostics,
  ) {}

  async expectLoadedFor(query: string): Promise<void> {
    this.diagnostics.throwIfTargetAccessFailed();
    await expect(this.page).toHaveURL(
      (url) => url.pathname === '/en/s' && url.searchParams.get('q') === query,
    );
    await expect(
      this.page.getByRole('heading', { level: 1, name: query, exact: true }),
    ).toBeVisible();
    await expect
      .poll(async () => (await this.readEntries()).length)
      .toBeGreaterThanOrEqual(2);
  }

  async readVisibleLots(): Promise<ObservedLot[]> {
    return (await this.readEntries()).map((entry) => entry.observation);
  }

  async expectAccessibleFor(query: string): Promise<void> {
    await expect(
      this.page.getByRole('heading', { level: 1, name: query, exact: true }),
    ).toBeVisible();
    await expect(this.actualLotLinks().first()).toHaveAccessibleName(/\S/);
  }

  async expectFallbackFor(query: string): Promise<void> {
    await this.expectLoadedFor(query);
    await expect(
      this.page.getByText(
        'No exact results. Check out these related objects.',
        { exact: true },
      ),
    ).toBeVisible();
  }

  async openLotAtPosition(position: number): Promise<ObservedLot> {
    if (!Number.isInteger(position) || position < 1) {
      throw new Error(
        `Lot position must be a positive one-based integer: ${position}`,
      );
    }

    const entries = await this.readEntries();
    const selected = entries[position - 1];

    if (selected === undefined) {
      throw new Error(
        `Requested lot ${position}, but only ${entries.length} actual lots were visible.`,
      );
    }

    try {
      await Promise.all([
        this.page.waitForURL(
          (url) => readLotId(url.toString()) === selected.observation.id,
        ),
        selected.link.click(),
      ]);
    } catch (error) {
      this.diagnostics.throwIfTargetAccessFailed();
      throw error;
    }

    this.diagnostics.throwIfTargetAccessFailed();
    return selected.observation;
  }

  private actualLotLinks(): Locator {
    // The href contract distinguishes actual lots from collection/promotional articles.
    return this.page.locator('main article a[href*="/en/l/"]:visible');
  }

  private async readEntries(): Promise<VisibleLotEntry[]> {
    const links = await this.actualLotLinks().all();
    const entries: VisibleLotEntry[] = [];
    const observedIds = new Set<string>();

    for (const link of links) {
      const href = await link.getAttribute('href');

      if (href === null) {
        throw new Error('An actual-lot link did not expose an href.');
      }

      const observation = createObservedLot(
        href,
        await link.locator('p').first().innerText(),
      );

      if (!observedIds.has(observation.id)) {
        observedIds.add(observation.id);
        entries.push({ link, observation });
      }
    }

    return entries;
  }
}
