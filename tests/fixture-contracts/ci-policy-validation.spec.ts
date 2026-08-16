import { expect, test } from '../fixtures/test.js';

test('controlled CI retry and artifact validation', async ({
  page,
}, testInfo) => {
  await page.setContent(
    '<main><h1>Network-free CI policy validation</h1></main>',
  );
  await expect(
    page.getByRole('heading', { name: 'Network-free CI policy validation' }),
  ).toBeVisible();

  expect(testInfo.retry, 'attempt zero must fail and retry one must pass').toBe(
    1,
  );
});
