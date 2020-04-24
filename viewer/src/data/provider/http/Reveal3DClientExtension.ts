/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, IdEither, ItemsResponse } from '@cognite/sdk';
import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';
import { ModelOutputProvider } from '../ModelOutputProvider';
import { File3dFormat } from '../../model/File3dFormat';
import { ModelOutputs } from '../../model/ModelOutputs';
import { BinaryFileProvider } from '../BinaryFileProvider';
import { JsonFileProvider } from '../JsonFileProvider';

export class Reveal3DClientExtension implements BinaryFileProvider, JsonFileProvider, ModelOutputProvider {
  private readonly httpClient: CogniteClient;
  constructor(httpClient: CogniteClient) {
    this.httpClient = httpClient;
  }

  async fetchJsonFileFromUrl<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async fetchJsonFileFromCdf<T>(blobId: number, filePath: string): Promise<T> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/blobs/${blobId}/${filePath}`;
    const response = await this.httpClient.get<T>(url);
    return response.data;
  }

  async fetchModelOutputsFromCdf(
    modelRevisionIds: IdEither,
    formats?: File3dFormat | undefined
  ): Promise<ItemsResponse<ModelOutputs>> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/outputs`;
    const request = {
      models: [modelRevisionIds],
      formats
    };
    const response = await this.httpClient.post<ItemsResponse<ModelOutputs>>(url, { data: request });
    return response.data;
  }

  async fetchBinaryFileFromCdf(blobId: number, filePath: string): Promise<Uint8Array> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/blobs/${blobId}/${filePath}`;
    const headers: HttpHeaders = {
      ...this.httpClient.getDefaultRequestHeaders(),
      Accept: '*/*'
    };
    const response = await fetch(`${this.httpClient.getBaseUrl()}${url}`, { method: 'GET', headers });
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async fetchBinaryFileFromUrl(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    return new Uint8Array(await response.arrayBuffer());
  }
}
