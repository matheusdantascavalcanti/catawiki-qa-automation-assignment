import { test as base, expect, type Page } from '@playwright/test';

import { HeaderSearch } from '../../src/capabilities/header-search.js';
import { LotDetails } from '../../src/capabilities/lot-details.js';
import { SearchResults } from '../../src/capabilities/search-results.js';
import { NetworkDiagnostics } from '../../src/diagnostics/network-diagnostics.js';

interface ProductFixtures {
  search: HeaderSearch;
  results: SearchResults;
  lot: LotDetails;
}

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: { CI_FEASIBILITY_EVIDENCE?: string } };
};

const recordFeasibilityEvidence = Boolean(
  (globalThis as RuntimeGlobal).process?.env?.CI_FEASIBILITY_EVIDENCE,
);

const diagnosticsByPage = new WeakMap<Page, NetworkDiagnostics>();

function diagnosticsFor(page: Page): NetworkDiagnostics {
  const diagnostics = diagnosticsByPage.get(page);

  if (diagnostics === undefined) {
    throw new Error('Network diagnostics were not registered for this page.');
  }

  return diagnostics;
}

export const test = base.extend<ProductFixtures>({
  page: async ({ page }, use, testInfo) => {
    const diagnostics = new NetworkDiagnostics(page);
    diagnosticsByPage.set(page, diagnostics);
    diagnostics.start();

    await use(page);

    diagnostics.stop();
    diagnosticsByPage.delete(page);
    if (recordFeasibilityEvidence) {
      const summary = diagnostics.summary();
      console.log(
        `Feasibility navigation evidence: ${JSON.stringify({
          classification: summary.classification,
          finalUrl: summary.finalUrl,
          mainDocuments: summary.mainDocuments,
        })}`,
      );
    }
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('network-diagnostics.json', {
        body: JSON.stringify(diagnostics.summary(), null, 2),
        contentType: 'application/json',
      });
    }
  },
  search: async ({ page }, use) => {
    await use(new HeaderSearch(page, diagnosticsFor(page)));
  },
  results: async ({ page }, use) => {
    await use(new SearchResults(page, diagnosticsFor(page)));
  },
  lot: async ({ page }, use) => {
    await use(new LotDetails(page, diagnosticsFor(page)));
  },
});

export { expect };
