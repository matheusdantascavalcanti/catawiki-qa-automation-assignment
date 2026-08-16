import { test } from '../fixtures/test.js';

test('searches from the compact header on mobile Chromium', async ({
  search,
  results,
}) => {
  await search.open();
  await search.searchFor('Train');
  await results.expectLoadedFor('Train');
});
