import type { ConsoleMessage, Page, Request, Response } from '@playwright/test';

type FailureClassification = 'ENVIRONMENT' | 'PRODUCT' | 'UNKNOWN';

interface MainDocumentRecord {
  url: string;
  status: number;
}

interface FailedRequestRecord {
  url: string;
  method: string;
  resourceType: string;
  failure: string;
  mainDocument: boolean;
}

interface ResponseErrorRecord {
  url: string;
  status: number;
  resourceType: string;
}

interface ConsoleErrorRecord {
  text: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export interface NetworkDiagnosticSummary {
  classification: FailureClassification;
  finalUrl: string;
  mainDocuments: MainDocumentRecord[];
  failedRequests: FailedRequestRecord[];
  firstPartyErrors: ResponseErrorRecord[];
  consoleErrors: ConsoleErrorRecord[];
  limits: {
    mainDocuments: number;
    failedRequests: number;
    firstPartyErrors: number;
    consoleErrors: number;
  };
}

const MAX_MAIN_DOCUMENTS = 5;
const MAX_FAILED_REQUESTS = 10;
const MAX_FIRST_PARTY_ERRORS = 10;
const MAX_CONSOLE_ERRORS = 10;
const ACCESS_STATUSES = new Set([401, 403, 429]);

function appendBounded<T>(items: T[], item: T, maximum: number): void {
  if (items.length < maximum) {
    items.push(item);
  }
}

function isFirstParty(url: string): boolean {
  const hostname = new URL(url).hostname;
  return hostname === 'catawiki.com' || hostname.endsWith('.catawiki.com');
}

export class TargetAccessError extends Error {
  override readonly name = 'TargetAccessError';
}

export class NetworkDiagnostics {
  private readonly mainDocuments: MainDocumentRecord[] = [];
  private readonly failedRequests: FailedRequestRecord[] = [];
  private readonly firstPartyErrors: ResponseErrorRecord[] = [];
  private readonly consoleErrors: ConsoleErrorRecord[] = [];

  constructor(private readonly page: Page) {}

  start(): void {
    this.page.on('response', this.onResponse);
    this.page.on('requestfailed', this.onRequestFailed);
    this.page.on('console', this.onConsole);
  }

  stop(): void {
    this.page.off('response', this.onResponse);
    this.page.off('requestfailed', this.onRequestFailed);
    this.page.off('console', this.onConsole);
  }

  throwIfTargetAccessFailed(): void {
    const blockedDocument = this.mainDocuments.find((record) =>
      ACCESS_STATUSES.has(record.status),
    );

    if (blockedDocument !== undefined) {
      throw new TargetAccessError(
        `Catawiki main document returned ${blockedDocument.status}: ${blockedDocument.url}`,
      );
    }

    const failedDocument = this.failedRequests.find(
      (request) => request.mainDocument,
    );

    if (failedDocument !== undefined) {
      throw new TargetAccessError(
        `Catawiki main document request failed (${failedDocument.failure}): ${failedDocument.url}`,
      );
    }
  }

  summary(): NetworkDiagnosticSummary {
    return {
      classification: this.classify(),
      finalUrl: this.page.url(),
      mainDocuments: [...this.mainDocuments],
      failedRequests: [...this.failedRequests],
      firstPartyErrors: [...this.firstPartyErrors],
      consoleErrors: [...this.consoleErrors],
      limits: {
        mainDocuments: MAX_MAIN_DOCUMENTS,
        failedRequests: MAX_FAILED_REQUESTS,
        firstPartyErrors: MAX_FIRST_PARTY_ERRORS,
        consoleErrors: MAX_CONSOLE_ERRORS,
      },
    };
  }

  private classify(): FailureClassification {
    if (
      this.mainDocuments.some((record) => ACCESS_STATUSES.has(record.status)) ||
      this.failedRequests.some((request) => request.mainDocument)
    ) {
      return 'ENVIRONMENT';
    }

    if (
      this.mainDocuments.some(
        (record) => record.status >= 500 && record.status <= 599,
      )
    ) {
      return 'PRODUCT';
    }

    return 'UNKNOWN';
  }

  private isMainDocument(request: Request): boolean {
    return (
      request.resourceType() === 'document' &&
      request.isNavigationRequest() &&
      request.frame() === this.page.mainFrame()
    );
  }

  private readonly onResponse = (response: Response): void => {
    const request = response.request();
    const status = response.status();

    if (this.isMainDocument(request)) {
      appendBounded(
        this.mainDocuments,
        { url: response.url(), status },
        MAX_MAIN_DOCUMENTS,
      );
    }

    if (status >= 400 && isFirstParty(response.url())) {
      appendBounded(
        this.firstPartyErrors,
        { url: response.url(), status, resourceType: request.resourceType() },
        MAX_FIRST_PARTY_ERRORS,
      );
    }
  };

  private readonly onRequestFailed = (request: Request): void => {
    appendBounded(
      this.failedRequests,
      {
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        failure: request.failure()?.errorText ?? 'Unknown request failure',
        mainDocument: this.isMainDocument(request),
      },
      MAX_FAILED_REQUESTS,
    );
  };

  private readonly onConsole = (message: ConsoleMessage): void => {
    if (message.type() !== 'error') {
      return;
    }

    const location = message.location();
    const record: ConsoleErrorRecord = { text: message.text() };

    if (location.url.length > 0) {
      record.url = location.url;
      record.lineNumber = location.lineNumber;
      record.columnNumber = location.columnNumber;
    }

    appendBounded(this.consoleErrors, record, MAX_CONSOLE_ERRORS);
  };
}
