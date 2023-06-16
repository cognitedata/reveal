/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

type InstanceType = 'node' | 'edge';

export type Item = {
  instanceType: InstanceType;
} & DmsUniqueIdentifier;

export type Source = {
  type: 'view';
  version: string;
} & DmsUniqueIdentifier;

export type DmsUniqueIdentifier = {
  space: string;
  externalId: string;
};

export type EdgeItem = {
  startNode: DmsUniqueIdentifier;
  endNode: DmsUniqueIdentifier;
};

export class DmsSDK {
  private readonly _sdk: CogniteClient;
  private readonly _byIdsEndpoint: string;
  private readonly _listEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    this._listEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/list`;
    this._byIdsEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/byids`;

    this._sdk = sdk;
  }

  public async getInstancesByExternalIds<T>(items: Item[], source: Source): Promise<T[]> {
    const result = await this._sdk.post(this._byIdsEndpoint, { data: { items, sources: [{ source }] } });
    if (result.status === 200) {
      return result.data.items.map((item: any) => item.properties[source.space][`${source.externalId}/1`] as T);
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async filterInstances(
    filter: any,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<EdgeItem[]> {
    const data: any = { filter, instanceType };
    if (source) {
      data.sources = [{ source }];
    }
    if (cursor) {
      data.cursor = cursor;
    }

    const result = await this._sdk.post(this._listEndpoint, { data });
    if (result.status === 200) {
      return result.data.items as EdgeItem[];
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}
