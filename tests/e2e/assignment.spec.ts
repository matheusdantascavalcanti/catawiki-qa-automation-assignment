import { expect, test } from '../fixtures/test.js';

test('opens the observed second Train lot and reads its auction details @smoke', async ({
  search,
  results,
  lot,
}, testInfo) => {
  await test.step('Search for Train with the magnifier button', async () => {
    await search.open();
    await search.searchFor('Train');
    await results.expectLoadedFor('Train');
  });

  const selectedLot =
    await test.step('Capture and open the second actual lot', async () => {
      const observation = await results.openLotAtPosition(2);
      await testInfo.attach('observed-lot.json', {
        body: JSON.stringify(observation, null, 2),
        contentType: 'application/json',
      });
      return observation;
    });

  await test.step('Prove destination entity continuity', async () => {
    await lot.expectSelectedLot(selectedLot);
  });

  const details =
    await test.step('Read and report auction details', async () => {
      const observation = await lot.readAuctionDetails();
      expect(observation.lotName).toBe(selectedLot.title);
      expect(observation.favourites).toBeGreaterThanOrEqual(0);
      expect(observation.price.displayedValue).toMatch(/\S/);
      await testInfo.attach('auction-details.json', {
        body: JSON.stringify(observation, null, 2),
        contentType: 'application/json',
      });
      return observation;
    });

  console.log(`Lot name: ${details.lotName}`);
  console.log(`Favourites: ${details.favourites}`);
  console.log(
    `${details.price.displayedLabel}: ${details.price.displayedValue}`,
  );
});
