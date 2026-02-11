/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, FileLink, IdEither } from '@cognite/sdk';
import { DMInstanceRef } from '@reveal/utilities';
import chunk from 'lodash/chunk';
import { DEFAULT_360_IMAGE_MIME_TYPE } from '../utilities/constants';

/**
 * File identifier types supported by CDF's /files/downloadlink endpoint.
 */
export type FileIdentifier = { id: number } | { externalId: string } | { instanceId: DMInstanceRef };

/**
 * Result of downloading a file, including both the data and the mimeType
 * extracted from the Content-Type response header.
 */
export type FileDownloadResult = {
  data: ArrayBuffer;
  mimeType: 'image/jpeg' | 'image/png';
};

function parseMimeType(contentType: string | null): 'image/jpeg' | 'image/png' {
  if (contentType) {
    const lowerContentType = contentType.toLowerCase();
    if (lowerContentType.includes('image/png')) {
      return 'image/png';
    }
    if (lowerContentType.includes('image/jpeg') || lowerContentType.includes('image/jpg')) {
      return 'image/jpeg';
    }
  }
  return DEFAULT_360_IMAGE_MIME_TYPE;
}

/**
 * Extracts the internal file ID from a CDF download URL.
 * Uses a generic approach: looks for two consecutive large numbers in the path,
 * where the pattern is {projectId}/{fileId}/ - the second number is the file ID.
 */
function extractFileIdFromDownloadUrl(downloadUrl: string): number | undefined {
  try {
    const decodedUrl = decodeURIComponent(downloadUrl);

    const match = decodedUrl.match(/\/(\d{10,})\/(\d{10,})\//);
    if (match) {
      const fileId = parseInt(match[2], 10);
      if (!isNaN(fileId)) {
        return fileId;
      }
    }
  } catch {
    // URL parsing failed, return undefined
  }
  return undefined;
}

export class CdfImageFileProvider {
  private readonly _client;

  constructor(sdk: CogniteClient) {
    this._client = sdk;
  }

  /**
   * Downloads files and returns both the data and mimeType (from Content-Type header).
   */
  public async getFileBuffersWithMimeType(
    fileIdentifiers: FileIdentifier[],
    abortSignal?: AbortSignal
  ): Promise<FileDownloadResult[]> {
    const fileLinks = await this.getDownloadUrls(fileIdentifiers, abortSignal);

    // Direct parallel downloads - browser handles connection pooling naturally
    return Promise.all(
      fileLinks.map(fileLink =>
        fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }).then(async response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          const mimeType = parseMimeType(response.headers.get('Content-Type'));
          const data = await response.arrayBuffer();
          return { data, mimeType };
        })
      )
    );
  }

  public async getFileBuffers(fileIdentifiers: FileIdentifier[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const results = await this.getFileBuffersWithMimeType(fileIdentifiers, abortSignal);
    return results.map(r => r.data);
  }

  /**
   * Downloads low-resolution icon versions of files.
   * The /files/icon endpoint only supports internal numeric IDs.
   */
  public async getIconBuffersWithMimeType(
    fileIdentifiers: FileIdentifier[],
    abortSignal?: AbortSignal
  ): Promise<FileDownloadResult[]> {
    const { withInternalId, withoutInternalId } = this.partitionIdentifiersByInternalId(fileIdentifiers);

    const resolvedIds = await this.resolveInternalIdsFromDownloadUrls(withoutInternalId, abortSignal);

    const allIds = [...withInternalId, ...resolvedIds];
    const iconResults = await this.fetchIconsById(
      allIds.map(item => item.id),
      abortSignal
    );

    return this.mergeResultsInOriginalOrder(allIds, iconResults, fileIdentifiers.length);
  }

  private partitionIdentifiersByInternalId(fileIdentifiers: FileIdentifier[]): {
    withInternalId: Array<{ index: number; id: number }>;
    withoutInternalId: Array<{ index: number; identifier: FileIdentifier }>;
  } {
    const withInternalId: Array<{ index: number; id: number }> = [];
    const withoutInternalId: Array<{ index: number; identifier: FileIdentifier }> = [];

    fileIdentifiers.forEach((identifier, index) => {
      if ('id' in identifier && identifier.id !== undefined) {
        withInternalId.push({ index, id: identifier.id });
      } else {
        withoutInternalId.push({ index, identifier });
      }
    });

    return { withInternalId, withoutInternalId };
  }

  /**
   * Resolves internal file IDs for identifiers that don't have them by fetching download URLs.
   * The /files/downloadlink response always includes the internal `id` for each file.
   */
  private async resolveInternalIdsFromDownloadUrls(
    identifiers: Array<{ index: number; identifier: FileIdentifier }>,
    abortSignal?: AbortSignal
  ): Promise<Array<{ index: number; id: number }>> {
    if (identifiers.length === 0) {
      return [];
    }

    const downloadLinks = await this.getDownloadUrls(
      identifiers.map(item => item.identifier),
      abortSignal
    );

    return identifiers.map((item, i) => {
      const link = downloadLinks[i];

      // Try to get id from response first
      if ('id' in link && typeof link.id === 'number') {
        return { index: item.index, id: link.id };
      }

      // Fallback: extract from download URL
      const fileId = extractFileIdFromDownloadUrl(link.downloadUrl);
      if (fileId === undefined) {
        throw new Error(`Could not resolve internal file ID for: ${JSON.stringify(item.identifier)}`);
      }
      return { index: item.index, id: fileId };
    });
  }

  private mergeResultsInOriginalOrder(
    indexedIds: Array<{ index: number; id: number }>,
    results: FileDownloadResult[],
    totalLength: number
  ): FileDownloadResult[] {
    const merged: FileDownloadResult[] = new Array(totalLength);
    indexedIds.forEach((item, i) => {
      merged[item.index] = results[i];
    });
    return merged;
  }

  private async fetchIconsById(fileIds: number[], abortSignal?: AbortSignal): Promise<FileDownloadResult[]> {
    if (fileIds.length === 0) {
      return [];
    }

    const baseUrl = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/icon`;
    const headers = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const options: RequestInit = {
      headers,
      signal: abortSignal,
      method: 'GET'
    };

    return Promise.all(
      fileIds.map(async id => {
        const url = `${baseUrl}?id=${id}`;
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`Failed to fetch icon: ${response.status} ${response.statusText}`);
        }
        const mimeType = parseMimeType(response.headers.get('Content-Type'));
        const data = await response.arrayBuffer();
        return { data, mimeType };
      })
    );
  }

  public async getIconBuffers(fileIdentifiers: FileIdentifier[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const results = await this.getIconBuffersWithMimeType(fileIdentifiers, abortSignal);
    return results.map(r => r.data);
  }

  private async getDownloadUrls(
    fileIdentifiers: FileIdentifier[],
    abortSignal?: AbortSignal
  ): Promise<(FileLink & IdEither)[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/downloadlink`;
    const headers: HeadersInit = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: 'application/json',
      'Content-type': 'application/json'
    };

    // Batch download URL requests to avoid sending too many file IDs in one request
    // CDF has a limit on the number of items per request
    const BATCH_SIZE = 1000;
    const batches = chunk(fileIdentifiers, BATCH_SIZE);

    const allLinks: (FileLink & IdEither)[] = [];

    for (const batch of batches) {
      const options: RequestInit = {
        headers,
        signal: abortSignal,
        method: 'POST',
        body: JSON.stringify({
          items: batch
        })
      };

      // Direct fetch - batching already handles API limits
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to get download URLs: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();

      allLinks.push(...result.items);
    }

    return allLinks;
  }
}
