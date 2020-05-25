/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, IdEither, ItemsResponse } from '@cognite/sdk';

import { BlobOutputMetadata, ModelUrlProvider } from './types';
import { Model3DOutputList } from './Model3DOutputList';
import { File3dFormat } from '../File3dFormat';
import { CadSceneProvider } from '@/dataModels/cad/CadSceneProvider';
import { CadSectorProvider } from '@/dataModels/cad/sector/CadSectorProvider';

interface OutputsRequest {
  models: IdEither[];
  formats?: (string | File3dFormat)[];
}

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CogniteClient3dExtensions
  implements ModelUrlProvider<{ modelRevision: IdEither; format: File3dFormat }>, CadSceneProvider, CadSectorProvider {
  private readonly client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  public async getCadSectorFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${blobUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };
    const response = await fetch(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  public async getCadScene(blobUrl: string): Promise<any> {
    const response = await this.client.get(`${blobUrl}/scene.json`);
    return response.data;
  }
  public async getModelUrl(params: { modelRevision: IdEither; format: File3dFormat }): Promise<string> {
    const outputs = await this.getOutputs(params.modelRevision, [params.format]);
    const blobId = outputs.findMostRecentOutput(params.format)!.blobId;
    return `${this.client.getBaseUrl()}/${this.buildBlobRequestPath(blobId)}`;
  }

  public async getOutputs(modelRevisionId: IdEither, formats?: (File3dFormat | string)[]): Promise<Model3DOutputList> {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/outputs`;
    const request: OutputsRequest = {
      models: [modelRevisionId],
      formats
    };
    const response = await this.client.post<ItemsResponse<{ model: IdEither; outputs: BlobOutputMetadata[] }>>(url, {
      data: request
    });
    if (response.status === 200) {
      const item = response.data.items[0];
      return new Model3DOutputList(item.model, item.outputs);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }
  private buildBlobRequestPath(blobId: number): string {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/blobs/${blobId}`;
    return url;
  }
}
