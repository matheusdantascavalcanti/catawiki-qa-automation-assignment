import { expect, test } from '../fixtures/test.js';

import { parseAuctionDisplay } from '../../src/parsing/auction-display.js';

const supportedDisplays = [
  {
    label: 'Current bid',
    value: '€2',
    expected: {
      state: 'current',
      displayedLabel: 'Current bid',
      displayedValue: '€2',
      currencySymbol: '€',
    },
  },
  {
    label: 'Starting bid',
    value: '€ 2',
    expected: {
      state: 'starting',
      displayedLabel: 'Starting bid',
      displayedValue: '€ 2',
      currencySymbol: '€',
    },
  },
  {
    label: 'Final bid',
    value: '€1,025',
    expected: {
      state: 'final',
      displayedLabel: 'Final bid',
      displayedValue: '€1,025',
      currencySymbol: '€',
    },
  },
  {
    label: '  Current   bid  ',
    value: ' £ 99 ',
    expected: {
      state: 'current',
      displayedLabel: 'Current bid',
      displayedValue: '£ 99',
      currencySymbol: '£',
    },
  },
] as const;

test.describe('auction display parser', () => {
  for (const display of supportedDisplays) {
    test(`parses ${display.label.trim()} with ${display.value.trim()}`, () => {
      expect(parseAuctionDisplay(display.label, display.value)).toEqual(
        display.expected,
      );
    });
  }

  test('rejects an unknown auction state', () => {
    expect(() => parseAuctionDisplay('Estimate', '€25')).toThrow(
      'Unsupported auction label',
    );
  });

  test('rejects an empty displayed value', () => {
    expect(() => parseAuctionDisplay('Current bid', '  ')).toThrow(
      'Auction value was empty',
    );
  });
});
