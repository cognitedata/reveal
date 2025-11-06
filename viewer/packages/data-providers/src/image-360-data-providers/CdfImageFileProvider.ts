/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, FileLink, IdEither } from '@cognite/sdk';
import chunk from 'lodash/chunk';

export class CdfImageFileProvider {
  private readonly _client;

  constructor(sdk: CogniteClient) {
    this._client = sdk;
  }

  public async getFileBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const fileLinks = await this.getDownloadUrls(fileIds, abortSignal);

    // Direct parallel downloads - browser handles connection pooling naturally
    return Promise.all(
      fileLinks.map(fileLink =>
        fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
      )
    );
  }

  public async getIconBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const url = `${this._client.getBaseUrl()}/api/v1/projects/${this._client.project}/files/icon?id=`;
    const headers = {
      ...this._client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const options: RequestInit = {
      headers,
      signal: abortSignal,
      method: 'GET'
    };

    // Direct parallel downloads - browser handles connection pooling naturally
    return Promise.all(
      fileIds.map(fileId =>
        fetch(url + fileId.id, options).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch icon: ${response.status} ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
      )
    );
  }

  private async getDownloadUrls(
    fileIds: { id: number }[],
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
    const batches = chunk(fileIds, BATCH_SIZE);

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
