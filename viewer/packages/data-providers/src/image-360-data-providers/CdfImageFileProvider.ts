/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, FileLink, IdEither } from '@cognite/sdk';
import { DMInstanceRef } from '@reveal/utilities';
import chunk from 'lodash/chunk';

/**
 * File identifier types supported by CDF's /files/downloadlink endpoint.
 * Using externalId or instanceId directly avoids the need for a separate
 * /files/byids call to resolve internal IDs.
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

/** Default mimeType when Content-Type header is missing or unrecognized */
const DEFAULT_MIME_TYPE = 'image/jpeg' as const;

/**
 * Parses the Content-Type header and returns a valid mimeType.
 * Falls back to 'image/jpeg' if the header is missing or unrecognized.
 */
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
  return DEFAULT_MIME_TYPE;
}

/**
 * Extracts the internal file ID from a CDF download URL.
 * The URL format is: .../files/storage/cognite/{projectId}%2F{fileId}%2F{filename}
 * The fileId is the second segment after decoding the path.
 *
 * Example: .../files/storage/cognite/1664458101624642%2F6493465271521017%2Fimage.jpeg
 * Returns: 6493465271521017
 */
function extractFileIdFromDownloadUrl(downloadUrl: string): number | undefined {
  try {
    const url = new URL(downloadUrl);
    const pathMatch = url.pathname.match(/\/files\/storage\/cognite\/([^?]+)/);
    if (pathMatch) {
      const decodedPath = decodeURIComponent(pathMatch[1]);
      const parts = decodedPath.split('/');
      if (parts.length >= 2) {
        const fileId = parseInt(parts[1], 10);
        if (!isNaN(fileId)) {
          return fileId;
        }
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
   * This eliminates the need for a separate /files/byids call to get mimeType.
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
   *
   * For files with only externalId or instanceId:
   * 1. First get download URLs via /files/downloadlink
   * 2. Extract internal file IDs from the download URLs
   * 3. Use those IDs with the /files/icon endpoint
   *
   * This avoids the need for a separate /files/byids call while still enabling fast icon loading.
   */
  public async getIconBuffersWithMimeType(
    fileIdentifiers: FileIdentifier[],
    abortSignal?: AbortSignal
  ): Promise<FileDownloadResult[]> {
    // Separate identifiers into those with internal IDs and those without
    const withInternalId: Array<{ index: number; id: number }> = [];
    const withoutInternalId: Array<{ index: number; identifier: FileIdentifier }> = [];

    fileIdentifiers.forEach((identifier, index) => {
      if ('id' in identifier && identifier.id !== undefined) {
        withInternalId.push({ index, id: identifier.id });
      } else {
        withoutInternalId.push({ index, identifier });
      }
    });

    // For files without internal IDs, get download URLs first to extract the IDs
    let resolvedIds: Array<{ index: number; id: number }> = [];
    if (withoutInternalId.length > 0) {
      const downloadLinks = await this.getDownloadUrls(
        withoutInternalId.map(item => item.identifier),
        abortSignal
      );

      // Extract internal file IDs from the download URLs
      resolvedIds = withoutInternalId
        .map((item, i) => {
          const fileId = extractFileIdFromDownloadUrl(downloadLinks[i].downloadUrl);
          return fileId !== undefined ? { index: item.index, id: fileId } : null;
        })
        .filter((item): item is { index: number; id: number } => item !== null);
    }

    // Combine all IDs and fetch icons
    const allIds = [...withInternalId, ...resolvedIds];
    const iconResults = await this.fetchIconsById(
      allIds.map(item => item.id),
      abortSignal
    );

    // Merge results back in original order
    const results: FileDownloadResult[] = new Array(fileIdentifiers.length);
    allIds.forEach((item, i) => {
      results[item.index] = iconResults[i];
    });

    return results;
  }

  /**
   * Fetches icon images using internal file IDs.
   * The /files/icon endpoint only supports internal numeric IDs.
   */
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
      fileIds.map(id => {
        const url = `${baseUrl}?id=${id}`;
        return fetch(url, options).then(async response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch icon: ${response.status} ${response.statusText}`);
          }
          const mimeType = parseMimeType(response.headers.get('Content-Type'));
          const data = await response.arrayBuffer();
          return { data, mimeType };
        });
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
