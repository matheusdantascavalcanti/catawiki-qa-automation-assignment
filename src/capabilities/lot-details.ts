import { expect, type Locator, type Page } from '@playwright/test';

import type { NetworkDiagnostics } from '../diagnostics/network-diagnostics.js';
import type {
  AuctionDetails,
  DisplayedAuctionPrice,
} from '../domain/auction.js';
import {
  normalizeLotTitle,
  type ObservedLot,
  readLotId,
} from '../domain/observed-lot.js';
import { parseAuctionDisplay } from '../parsing/auction-display.js';

interface RawAuctionDisplay {
  displayedLabel: string;
  displayedValue: string;
}

export class LotDetails {
  constructor(
    private readonly page: Page,
    private readonly diagnostics: NetworkDiagnostics,
  ) {}

  async expectSelectedLot(selected: ObservedLot): Promise<void> {
    this.diagnostics.throwIfTargetAccessFailed();
    await expect(this.page).toHaveURL(
      (url) => readLotId(url.toString()) === selected.id,
    );
    await expect(
      this.page.getByRole('heading', {
        level: 1,
        name: selected.title,
        exact: true,
      }),
    ).toBeVisible();
  }

  async readAuctionDetails(): Promise<AuctionDetails> {
    this.diagnostics.throwIfTargetAccessFailed();
    const lotName = normalizeLotTitle(
      await this.page.getByRole('heading', { level: 1 }).innerText(),
    );
    const favourites = await this.readFavourites();
    const price = await this.readAuctionPrice();

    return { lotName, favourites, price };
  }

  private async readFavourites(): Promise<number> {
    // Related-lot favourite buttons have a test id; the primary read-only control does not.
    const favouriteButton = this.page.locator(
      'main button[title="favourite"]:not([data-testid])',
    );
    await expect(favouriteButton).toHaveCount(1);
    await expect(favouriteButton).toBeVisible();
    const rawCount =
      (await favouriteButton.getAttribute('count')) ??
      (await favouriteButton.innerText());

    if (!/^\d+$/.test(rawCount.trim())) {
      throw new Error(
        `Unsupported favourites count: ${JSON.stringify(rawCount)}`,
      );
    }

    return Number.parseInt(rawCount, 10);
  }

  private async readAuctionPrice(): Promise<DisplayedAuctionPrice> {
    const auctionRegion = this.primaryAuctionRegion();
    await expect(auctionRegion).toHaveCount(1);

    // Catawiki renders duplicate responsive copies inside the primary bidding region.
    // Component identity avoids hashed classes; unique domain values are required.
    const amounts = auctionRegion.locator(
      'div[data-sentry-component="Amount"]:visible',
    );
    await expect.poll(async () => amounts.count()).toBeGreaterThan(0);
    const rawDisplays = await amounts.evaluateAll(
      (elements): RawAuctionDisplay[] =>
        elements.map((element) => ({
          displayedLabel:
            element.previousElementSibling?.textContent?.trim() ?? '',
          displayedValue: element.textContent?.trim() ?? '',
        })),
    );
    const uniqueDisplays = new Map<string, DisplayedAuctionPrice>();

    for (const rawDisplay of rawDisplays) {
      const parsed = parseAuctionDisplay(
        rawDisplay.displayedLabel,
        rawDisplay.displayedValue,
      );
      uniqueDisplays.set(JSON.stringify(parsed), parsed);
    }

    if (uniqueDisplays.size !== 1) {
      throw new Error(
        `Expected one unique auction display, received: ${JSON.stringify(rawDisplays)}`,
      );
    }

    return [...uniqueDisplays.values()][0] as DisplayedAuctionPrice;
  }

  private primaryAuctionRegion(): Locator {
    const primaryHeading = this.page.getByRole('heading', { level: 1 });
    const primaryLotRegion = this.page.locator('main > div').filter({
      has: primaryHeading,
    });

    // The bidding column is the single direct child of the primary lot region that
    // owns an Amount. Related-lot collections are sibling regions outside this scope.
    return primaryLotRegion.locator(':scope > div').filter({
      has: this.page.locator('div[data-sentry-component="Amount"]'),
    });
  }
}
