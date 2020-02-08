/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { CDFHttpClient } from '@cognite/sdk/dist/src/utils/http/cdfHttpClient';

export interface VersionedBlob {
  version: number;
  blobs: { [key: string]: number };
  // blobId: CogniteInternalId;
}

export interface Model3dOutput {
  outputType: string;
  versions: VersionedBlob[];
}

export type Model3dOutputs = Model3dOutput[];

export class CogniteClient3dV2Extensions {
  private readonly client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  get defaultHeaders(): { [key: string]: string } {
    return (this.client as any).httpClient.defaultHeaders;
  }

  async retrieveJsonBlob<T>(blobId: number, path?: string): Promise<T> {
    const url = this.buildBlobBaseUrl(blobId) + (path ? `/${path}` : '');
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async retrieveBinaryBlob(blobId: number, path?: string): Promise<ArrayBuffer> {
    const url = this.buildBlobBaseUrl(blobId) + (path ? `/${path}` : '');
    const response = await this.client.get<ArrayBuffer>(url);
    return response.data;
  }

  buildBlobBaseUrl(blobId: number): string {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/blobs/${blobId}`;
    return url;
  }

  async getOutputs(modelRevisionId: number): Promise<Model3dOutputs> {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/pointcloud/entwine/describe`;
    const response = await this.client.get<Model3dOutput>(url, { params: { modelId: modelRevisionId } });
    const output = { outputType: 'ept', ...response.data };
    return [output];
  }
}
