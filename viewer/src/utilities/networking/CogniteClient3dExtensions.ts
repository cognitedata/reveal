/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, CogniteInternalId, CogniteExternalId, IdEither } from '@cognite/sdk';
import { File3dFormat } from '../File3dFormat';

export type Model3dOutput = {
  readonly format: File3dFormat | string;
  readonly version: number;
  readonly blobId: CogniteInternalId;
};

export class Model3dOutputList {
  public readonly model: CogniteModel3dIdentifier;
  public readonly outputs: Model3dOutput[];

  constructor(model: CogniteModel3dIdentifier, outputs: Model3dOutput[]) {
    this.model = model;
    this.outputs = outputs;
  }

  /**
   * Finds an output with a given format of the most recent version.
   *
   * @param outputFormat        Format to find output for, either a well known format a custom format.
   * @param supportedVersions   Optional list of supported version. If not provided all versions are considered.
   */
  public findMostRecentOutput(
    outputFormat: File3dFormat | string,
    supportedVersions?: number[]
  ): Model3dOutput | undefined {
    const candidates = this.outputs.filter(
      x => x.format === outputFormat && (!supportedVersions || supportedVersions.indexOf(x.version) !== -1)
    );
    return candidates.length > 0
      ? candidates.reduce((left, right) => {
          return right.version > left.version ? right : left;
        })
      : undefined;
  }
}

type CogniteModel3dIdentifier = { id: CogniteInternalId } | { externalId: CogniteExternalId };

interface OutputsRequest {
  models: IdEither[];
  formats?: (string | File3dFormat)[];
}

interface OutputsResponse {
  readonly items: {
    readonly model: CogniteModel3dIdentifier;
    readonly outputs: Model3dOutput[];
  }[];
}

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CogniteClient3dExtensions {
  private readonly client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  public async retrieveJsonBlob<T>(blobId: number, path?: string): Promise<T> {
    const url = this.buildBlobRequestPath(blobId) + (path ? `/${path}` : '');
    const response = await this.client.get<T>(url);
    return response.data;
  }

  public async retrieveBinaryBlob(blobId: number, path?: string): Promise<ArrayBuffer> {
    const baseUrl = this.client.getBaseUrl();
    const blobUrl = this.buildBlobRequestPath(blobId);
    const pathUrl = path ? `/${path}` : '';
    const url = `${baseUrl}${blobUrl}${pathUrl}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await fetch(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  public buildBlobRequestPath(blobId: number): string {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/blobs/${blobId}`;
    return url;
  }

  public async getOutputs(modelRevisionId: IdEither, formats?: (File3dFormat | string)[]): Promise<Model3dOutputList> {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/outputs`;
    const request: OutputsRequest = {
      models: [modelRevisionId],
      formats
    };
    const response = await this.client.post<OutputsResponse>(url, { data: request });
    if (response.status === 200) {
      const item = response.data.items[0];
      return new Model3dOutputList(item.model, item.outputs);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }
}
