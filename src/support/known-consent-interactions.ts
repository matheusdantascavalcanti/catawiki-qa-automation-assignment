import type { Page } from '@playwright/test';

const interactionCountByPage = new WeakMap<Page, number>();

export function initializeKnownConsentInteractions(page: Page): void {
  interactionCountByPage.set(page, 0);
}

export function recordKnownConsentInteraction(page: Page): void {
  interactionCountByPage.set(page, readKnownConsentInteractionCount(page) + 1);
}

export function readKnownConsentInteractionCount(page: Page): number {
  const interactionCount = interactionCountByPage.get(page);

  if (interactionCount === undefined) {
    throw new Error(
      'Known consent interaction tracking was not registered for this page.',
    );
  }

  return interactionCount;
}

export function clearKnownConsentInteractions(page: Page): void {
  interactionCountByPage.delete(page);
}
