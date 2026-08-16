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
    await this.expectQueryPageFor(query);
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
    await this.expectQueryPageFor(query);
    await expect(
      this.page.getByText(
        'No exact results. Check out these related objects.',
        { exact: true },
      ),
    ).toBeVisible();
    await expect(this.actualLotLinks().first()).toHaveAccessibleName(/\S/);
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

    await this.dismissObstructionIfVisible();

    try {
      await this.openSelectedLot(selected);
    } catch (error) {
      this.diagnostics.throwIfTargetAccessFailed();

      if (!(await this.dismissObstructionIfVisible())) {
        throw error;
      }

      await this.openSelectedLot(selected);
    }

    this.diagnostics.throwIfTargetAccessFailed();
    return selected.observation;
  }

  private async openSelectedLot(selected: VisibleLotEntry): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        (url) => readLotId(url.toString()) === selected.observation.id,
      ),
      selected.link.click(),
    ]);
  }

  private async dismissObstructionIfVisible(): Promise<boolean> {
    const obstructionAction = this.page
      .getByRole('button', {
        name: /^(Accept all(?: cookies)?|Continue in English)$/i,
      })
      .first();

    if (!(await obstructionAction.isVisible())) {
      return false;
    }

    await obstructionAction.click();
    return true;
  }

  private actualLotLinks(): Locator {
    // The href contract distinguishes actual lots from collection/promotional articles.
    return this.page.locator('main article a[href*="/en/l/"]:visible');
  }

  private async expectQueryPageFor(query: string): Promise<void> {
    this.diagnostics.throwIfTargetAccessFailed();
    await expect(this.page).toHaveURL(
      (url) => url.pathname === '/en/s' && url.searchParams.get('q') === query,
    );
    await expect(
      this.page.getByRole('heading', { level: 1, name: query, exact: true }),
    ).toBeVisible();
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
