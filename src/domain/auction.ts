export type AuctionPriceState = 'current' | 'starting' | 'final';

export interface DisplayedAuctionPrice {
  state: AuctionPriceState;
  displayedLabel: string;
  displayedValue: string;
  currencySymbol?: string;
}

export interface AuctionDetails {
  lotName: string;
  favourites: number;
  price: DisplayedAuctionPrice;
}
