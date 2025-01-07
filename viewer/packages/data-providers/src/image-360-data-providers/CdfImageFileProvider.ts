/*!
 * Copyright 2025 Cognite AS
 */
import { CogniteClient, FileLink, IdEither } from '@cognite/sdk';

export class CdfImageFileProvider {
  private readonly _client;

  constructor(sdk: CogniteClient) {
    this._client = sdk;
  }

  public async getFileBuffers(fileIds: { id: number }[], abortSignal?: AbortSignal): Promise<ArrayBuffer[]> {
    const fileLinks = await this.getDownloadUrls(fileIds, abortSignal);
    return Promise.all(
      fileLinks
        .map(fileLink => fetch(fileLink.downloadUrl, { method: 'GET', signal: abortSignal }))
        .map(async response => (await response).arrayBuffer())
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

    return Promise.all(
      fileIds.map(fileId => fetch(url + fileId.id, options)).map(async response => (await response).arrayBuffer())
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

    const options: RequestInit = {
      headers,
      signal: abortSignal,
      method: 'POST',
      body: JSON.stringify({
        items: fileIds
      })
    };

    const result = await (await fetch(url, options)).json();
    return result.items;
  }
}
