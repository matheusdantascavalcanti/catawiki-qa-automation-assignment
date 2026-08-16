import { defineConfig, devices } from '@playwright/test';

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: { CI?: string } };
};

const isCI = Boolean((globalThis as RuntimeGlobal).process?.env?.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  retryStrategy: 'isolated',
  failOnFlakyTests: isCI,
  reporter: isCI
    ? [['line'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'line',
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'https://www.catawiki.com/en/',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure-and-retries',
  },
  projects: [
    {
      name: 'unit',
      testDir: './tests/unit',
      testMatch: '**/*.spec.ts',
    },
    {
      name: 'fixture-contracts',
      testDir: './tests/fixture-contracts',
      testMatch: '**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'chromium',
      testDir: './tests/e2e',
      testIgnore: '**/*.mobile.spec.ts',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'firefox',
      testDir: './tests/e2e',
      testMatch: '**/assignment.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests/e2e',
      testMatch: '**/assignment.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chromium',
      testDir: './tests/e2e',
      testMatch: '**/*.mobile.spec.ts',
      use: { ...devices['Pixel 7'], channel: 'chromium' },
    },
  ],
});
