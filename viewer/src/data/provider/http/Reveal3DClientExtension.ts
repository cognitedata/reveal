/*!
 * Copyright 2020 Cognite AS
 */

import { BinaryBlobFileProvider } from '../BinaryBlobFileProvider';
import { CogniteClient, IdEither, ItemsResponse } from '@cognite/sdk';
import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';
import { ModelOutputProvider } from '../ModelOutputProvider';
import { File3DFormat } from '../../model/File3DFormat';
import { ModelOutputs } from '../../model/ModelOutputs';
import { JsonBlobFileProvider } from '../JsonBlobFileProvider';
import { BinaryFileProvider } from '../BinaryFileProvider';
import { JsonFileProvider } from '../JsonFileProvider';

export class Reveal3DClientExtension implements BinaryBlobFileProvider, BinaryFileProvider, JsonBlobFileProvider, JsonFileProvider, ModelOutputProvider {
  private readonly httpClient: CogniteClient;
  constructor(httpClient: CogniteClient) {
    this.httpClient = httpClient;
  }

  async getOutputsForModel(
    modelRevisionIds: IdEither,
    formats?: File3DFormat | undefined
  ): Promise<ItemsResponse<ModelOutputs>> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/outputs`;
    const request = {
      models: [modelRevisionIds],
      formats
    };
    const response = await this.httpClient.post<ItemsResponse<ModelOutputs>>(url, { data: request });
    return response.data;
  }

  async fetchJsonFileByPath<T>(blobId: number, filePath: string): Promise<T> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/blobs/${blobId}/${filePath}`;
    const response = await this.httpClient.get<T>(url);
    return response.data;
  }

  async fetchBinaryFileByPath(blobId: number, filePath: string): Promise<Uint8Array> {
    const url = `/api/playground/projects/${this.httpClient.project}/3d/v2/blobs/${blobId}/${filePath}`;
    const headers: HttpHeaders = {
      ...this.httpClient.getDefaultRequestHeaders(),
      Accept: '*/*'
    };
    const response = await fetch(`${this.httpClient.getBaseUrl()}${url}`, { method: 'GET', headers });
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async fetchJsonFileByUrl<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async fetchBinaryFileByUrl(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    return new Uint8Array(await response.arrayBuffer());
  }
}
