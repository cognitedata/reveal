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

export type EdgeItem<PropertiesType> = {
  startNode: DmsUniqueIdentifier;
  endNode: DmsUniqueIdentifier;
  properties: PropertiesType;
};

export class FdmSDK {
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

  public async getInstancesByExternalIds<T = { [key: string]: any }>(items: Item[], source: Source): Promise<T []> {
    const result = await this._sdk.post(this._byIdsEndpoint, { data: { items, sources: [{ source }] } });

    if (result.status === 200) {
      return result.data.items;
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async filterInstances<PropertiesType = {[key: string]: any}>(
    filter: any,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<{ edges: EdgeItem<PropertiesType>[]; nextCursor?: string }> {
    const data: any = { filter, instanceType };
    if (source) {
      data.sources = [{ source }];
    }
    if (cursor) {
      data.cursor = cursor;
    }

    const result = await this._sdk.post(this._listEndpoint, { data });
    if (result.status === 200) {
      return { edges: result.data.items as EdgeItem<PropertiesType>[], nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}