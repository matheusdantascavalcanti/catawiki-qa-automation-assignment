import { expect, test } from '../fixtures/test.js';

const SEARCH_NAME = 'Search for brand, model, artist...';

test.use({ actionTimeout: 500 });

test.beforeEach(async ({ page }) => {
  await page.route('https://www.catawiki.com/**', async (route) => {
    await route.fulfill({
      contentType: 'text/html',
      body: `
        <!doctype html>
        <style>
          aside {
            background: white;
            inset: 0;
            position: fixed;
            z-index: 1;
          }
          [hidden] {
            display: none !important;
          }
        </style>
        <button class="c-header__mobile-nav__search" type="button">
          Open compact search
        </button>
        <div id="compact-search" hidden>
          <label>
            Search for brand, model, artist...
            <input role="combobox" />
          </label>
          <button id="search" type="button">Search</button>
        </div>
        <aside id="usercentrics-cmp-ui" hidden>
          <button type="button">Accept All</button>
        </aside>
        <script>
          window.contractState = {
            collapseAfterConsent: false,
            consentAfterOpen: false,
            consentAfterQuery: false,
            disableSearch: false,
            openCount: 0,
            submitCount: 0,
          };

          const compactSearch = document.querySelector('#compact-search');
          const consent = document.querySelector('#usercentrics-cmp-ui');
          const input = document.querySelector('input');
          const opener = document.querySelector('.c-header__mobile-nav__search');
          const search = document.querySelector('#search');

          opener.addEventListener('click', () => {
            window.contractState.openCount += 1;
            compactSearch.hidden = false;
            opener.hidden = true;
            if (
              window.contractState.disableSearch &&
              window.contractState.openCount === 2
            ) {
              search.disabled = true;
            }
            if (window.contractState.consentAfterOpen) {
              window.contractState.consentAfterOpen = false;
              consent.hidden = false;
            }
          });

          input.addEventListener('input', () => {
            if (window.contractState.consentAfterQuery) {
              window.contractState.consentAfterQuery = false;
              consent.hidden = false;
            }
          });

          consent.querySelector('button').addEventListener('click', () => {
            consent.hidden = true;
            if (window.contractState.collapseAfterConsent) {
              compactSearch.hidden = true;
              opener.hidden = false;
              input.value = '';
            }
          });

          search.addEventListener('click', () => {
            window.contractState.submitCount += 1;
            history.pushState({}, '', '/en/s?q=' + encodeURIComponent(input.value));
          });
        </script>
      `,
    });
  });

  await page.goto('https://www.catawiki.com/en/');
});

test('uses the simple compact-search path when consent does not appear', async ({
  page,
  search,
}) => {
  await search.searchFor('Train');

  await expect(page).toHaveURL('https://www.catawiki.com/en/s?q=Train');
  await expect
    .poll(() => page.evaluate(() => window.contractState.openCount))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.contractState.submitCount))
    .toBe(1);
});

test('restores and submits compact search after known consent collapses it', async ({
  page,
  search,
}) => {
  await page.evaluate(() => {
    window.contractState.consentAfterQuery = true;
    window.contractState.collapseAfterConsent = true;
  });

  await search.searchFor('Train');

  await expect(page).toHaveURL('https://www.catawiki.com/en/s?q=Train');
  await expect(
    page.getByRole('combobox', { name: SEARCH_NAME, exact: true }),
  ).toHaveValue('Train');
  await expect
    .poll(() => page.evaluate(() => window.contractState.openCount))
    .toBe(2);
  await expect
    .poll(() => page.evaluate(() => window.contractState.submitCount))
    .toBe(1);
});

test('restores compact readiness when known consent collapses it before entry', async ({
  page,
  search,
}) => {
  await page.evaluate(() => {
    window.contractState.consentAfterOpen = true;
    window.contractState.collapseAfterConsent = true;
  });

  await search.searchFor('Train');

  await expect(page).toHaveURL('https://www.catawiki.com/en/s?q=Train');
  await expect
    .poll(() => page.evaluate(() => window.contractState.openCount))
    .toBe(2);
  await expect
    .poll(() => page.evaluate(() => window.contractState.submitCount))
    .toBe(1);
});

test('recovers at most once and surfaces a second submission failure', async ({
  page,
  search,
}) => {
  await page.evaluate(() => {
    window.contractState.consentAfterQuery = true;
    window.contractState.collapseAfterConsent = true;
    window.contractState.disableSearch = true;
  });

  await expect(search.searchFor('Train')).rejects.toThrow(/Timeout/);
  await expect
    .poll(() => page.evaluate(() => window.contractState.openCount))
    .toBe(2);
  await expect
    .poll(() => page.evaluate(() => window.contractState.submitCount))
    .toBe(0);
});

test('does not recover an unrelated Search action failure', async ({
  page,
  search,
}) => {
  await page.evaluate(() => {
    const searchButton = document.querySelector('#search');
    searchButton?.setAttribute('disabled', '');
  });

  await expect(search.searchFor('Train')).rejects.toThrow(/Timeout/);
  await expect
    .poll(() => page.evaluate(() => window.contractState.openCount))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.contractState.submitCount))
    .toBe(0);
});

declare global {
  interface Window {
    contractState: {
      collapseAfterConsent: boolean;
      consentAfterOpen: boolean;
      consentAfterQuery: boolean;
      disableSearch: boolean;
      openCount: number;
      submitCount: number;
    };
  }
}
