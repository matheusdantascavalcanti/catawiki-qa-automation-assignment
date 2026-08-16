import { test } from '../fixtures/test.js';

test('submits search with Enter and exposes narrow semantics @a11y', async ({
  search,
  results,
}) => {
  await search.open();
  await search.expectAccessible();

  await search.searchFor('Train', { submitWith: 'enter' });
  await results.expectLoadedFor('Train');
  await results.expectAccessibleFor('Train');
});

test('shows related objects when no exact results are available', async ({
  search,
  results,
}) => {
  const query = 'phase03exactnomatch7f92c4';

  await search.open();
  await search.searchFor(query);
  await results.expectFallbackFor(query);
});
