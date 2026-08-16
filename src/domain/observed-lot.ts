export interface ObservedLot {
  id: string;
  title: string;
  href: string;
}

const LOT_PATH = /^\/en\/l\/(\d+)(?:-|$)/;

export function normalizeLotTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

export function readLotId(href: string): string | undefined {
  const url = new URL(href, 'https://www.catawiki.com');
  return LOT_PATH.exec(url.pathname)?.[1];
}

export function createObservedLot(href: string, title: string): ObservedLot {
  const id = readLotId(href);
  const normalizedTitle = normalizeLotTitle(title);

  if (id === undefined) {
    throw new Error(`Expected an English Catawiki lot URL, received: ${href}`);
  }

  if (normalizedTitle.length === 0) {
    throw new Error(`Lot ${id} did not expose a readable title.`);
  }

  return { id, title: normalizedTitle, href };
}
