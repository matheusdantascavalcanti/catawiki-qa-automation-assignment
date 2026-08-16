import { expect, test } from '../fixtures/test.js';

test.beforeEach(async ({ page }) => {
  await page.setContent(`
    <style>
      aside, dialog {
        background: white;
        inset: 0;
        position: fixed;
        z-index: 1;
      }
    </style>
    <button id="target" type="button">Target action</button>
    <aside id="usercentrics-cmp-ui" hidden>
      <button type="button">Accept all</button>
    </aside>
    <script>
      window.dismissalCount = 0;
      window.targetActionCount = 0;
      document.querySelector('#target').addEventListener('click', () => {
        window.targetActionCount += 1;
      });
      document
        .querySelector('#usercentrics-cmp-ui button')
        .addEventListener('click', () => {
          window.dismissalCount += 1;
          document.querySelector('#usercentrics-cmp-ui').hidden = true;
        });
    </script>
  `);
});

async function showUsercentricsAction(
  page: import('@playwright/test').Page,
  actionName: string,
): Promise<void> {
  await page
    .locator('aside#usercentrics-cmp-ui')
    .evaluate((usercentrics, name) => {
      const action = usercentrics.querySelector('button');

      if (action === null) {
        throw new Error('Expected the Usercentrics action fixture.');
      }

      action.textContent = name;
      usercentrics.removeAttribute('hidden');
    }, actionName);
}

test('handles a delayed Accept all action', async ({ page }) => {
  const overlay = page.locator('aside#usercentrics-cmp-ui');

  await page.evaluate(() => {
    setTimeout(() => {
      const usercentrics = document.querySelector('aside#usercentrics-cmp-ui');
      usercentrics?.removeAttribute('hidden');
    }, 50);
  });
  await page.waitForFunction(
    () =>
      document
        .querySelector('aside#usercentrics-cmp-ui')
        ?.hasAttribute('hidden') === false,
  );

  await page.getByRole('button', { name: 'Target action' }).click();

  await expect(overlay).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(1);
  await expect
    .poll(() => page.evaluate(() => window.targetActionCount))
    .toBe(1);
});

for (const actionName of [
  'Accept All',
  'Accept All Cookies',
  'Continue In English',
]) {
  test(`handles the approved ${actionName} capitalization`, async ({
    page,
  }) => {
    await showUsercentricsAction(page, actionName);

    await page.getByRole('button', { name: 'Target action' }).click();

    await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(1);
    await expect
      .poll(() => page.evaluate(() => window.targetActionCount))
      .toBe(1);
  });
}

test('does not handle an unrelated Usercentrics label', async ({ page }) => {
  const overlay = page.locator('aside#usercentrics-cmp-ui');
  const target = page.getByRole('button', { name: 'Target action' });

  await showUsercentricsAction(page, 'Please Accept All');

  await expect(target.click({ timeout: 500 })).rejects.toThrow(
    /intercepts pointer events|Timeout/,
  );
  await expect(overlay).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(0);
  await expect
    .poll(() => page.evaluate(() => window.targetActionCount))
    .toBe(0);
});

test('bounds invocation and leaves exhaustion to normal action failure', async ({
  page,
}) => {
  const overlay = page.locator('aside#usercentrics-cmp-ui');
  const target = page.getByRole('button', { name: 'Target action' });

  await overlay.evaluate((element) => element.removeAttribute('hidden'));
  await target.click();
  await overlay.evaluate((element) => element.removeAttribute('hidden'));
  await target.click();
  await overlay.evaluate((element) => element.removeAttribute('hidden'));

  await expect(target.click({ timeout: 500 })).rejects.toThrow(
    /intercepts pointer events|Timeout/,
  );
  await expect(overlay).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(2);
  await expect
    .poll(() => page.evaluate(() => window.targetActionCount))
    .toBe(2);
});

test('does not hide an unrelated failing action', async ({ page }) => {
  const unavailableAction = page.getByRole('button', {
    name: 'Unavailable action',
  });

  await expect(unavailableAction.click({ timeout: 500 })).rejects.toThrow(
    /Unavailable action/,
  );
  await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(0);
});

test('does not consume arbitrary dialogs', async ({ page }) => {
  await page.locator('body').evaluate((body) => {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = '<button type="button">Accept all</button>';
    body.append(dialog);
    dialog.showModal();
  });
  const arbitraryDialog = page.getByRole('dialog');

  await expect(
    page.getByRole('button', { name: 'Target action' }).click({ timeout: 500 }),
  ).rejects.toThrow(/intercepts pointer events|Timeout/);
  await expect(arbitraryDialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.dismissalCount)).toBe(0);
});

declare global {
  interface Window {
    dismissalCount: number;
    targetActionCount: number;
  }
}
