import type {
  AuctionPriceState,
  DisplayedAuctionPrice,
} from '../domain/auction.js';

const AUCTION_STATES: Readonly<Record<string, AuctionPriceState>> = {
  'current bid': 'current',
  'starting bid': 'starting',
  'final bid': 'final',
};

export function parseAuctionDisplay(
  displayedLabel: string,
  displayedValue: string,
): DisplayedAuctionPrice {
  const normalizedLabel = displayedLabel.replace(/\s+/g, ' ').trim();
  const state = AUCTION_STATES[normalizedLabel.toLowerCase()];
  const value = displayedValue.trim();

  if (state === undefined) {
    throw new Error(
      `Unsupported auction label: ${JSON.stringify(displayedLabel)}`,
    );
  }

  if (value.length === 0) {
    throw new Error(`Auction value was empty for label: ${normalizedLabel}`);
  }

  const currencySymbol = value.match(/\p{Sc}/u)?.[0];

  return currencySymbol === undefined
    ? { state, displayedLabel: normalizedLabel, displayedValue: value }
    : {
        state,
        displayedLabel: normalizedLabel,
        displayedValue: value,
        currencySymbol,
      };
}
