/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

type InstanceType = 'node' | 'edge';

export type Item = {
  instanceType: InstanceType;
} & InstanceIdentifier;

export type Source = {
  type: 'view';
  version: string;
} & InstanceIdentifier;

export type InstanceIdentifier = {
  space: string;
  externalId: string;
};

export type EdgeItem = {
  startNode: InstanceIdentifier;
  endNode: InstanceIdentifier;
};

export type Query = {
  with: Record<string, ResultSetExpression>;
  select: Record<string, QuerySelect>;
  parameters?: Record<string, string | number>;
  cursors?: Record<string, string>;
};

type QuerySelect = {
  sources: readonly SourceProperties[];
};

type SourceProperties = {
  source: TestSource;
  properties: readonly string[];
};

type TestSource = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type ResultSetExpression = (NodeResultSetExpression | EdgeResultSetExpression) & {
  limit?: number;
  sort?: any[];
};

export type NodeResultSetExpression = {
  nodes: {
    filter?: any;
    from?: any;
    through?: any;
    chainTo?: any;
  };
};

export type EdgeResultSetExpression = {
  edges: {
    filter?: any;
    from?: any;
    nodeFilter?: any;
    maxDistance?: number;
    direction?: 'outwards' | 'inwards';
    limitEach?: number;
  };
};

export type NodeResult = {
  instanceType: 'node';
  version: number;
  createdTime: number;
  lastUpdatedTime: number;
  properties: Record<string, any>;
  space: string;
  externalId: string;
};

export type EdgeResult = {
  instanceType: 'node';
  version: number;
  type: InstanceIdentifier;
  createdTime: number;
  lastUpdatedTime: number;
  startNode: InstanceIdentifier;
  endNode: InstanceIdentifier;
  properties: any;
} & InstanceIdentifier;

type SelectKey<T extends Query> = keyof T['select'];

type QueryResult<T extends Query> = {
  items: Record<SelectKey<T>, NodeResult[]>;
  nextCursor: Record<SelectKey<T>, string> | undefined;
};

export class DmsSDK {
  private readonly _sdk: CogniteClient;
  private readonly _byIdsEndpoint: string;
  private readonly _listEndpoint: string;
  private readonly _queryEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    this._listEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/list`;
    this._byIdsEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/byids`;
    this._queryEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/query`;

    this._sdk = sdk;
  }

  public async getInstancesByExternalIds<T>(items: Item[], source: Source): Promise<(T & { externalId: string })[]> {
    const result = await this._sdk.post(this._byIdsEndpoint, { data: { items, sources: [{ source }] } });
    if (result.status === 200) {
      return result.data.items.map((item: any) => {
        return { ...item.properties[source.space][`${source.externalId}/1`], externalId: item.externalId };
      });
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async filterInstances(
    filter: any,
    instanceType: InstanceType,
    source?: Source,
    cursor?: string
  ): Promise<{ edges: EdgeItem[]; nextCursor?: string }> {
    const data: any = { filter, instanceType };
    if (source) {
      data.sources = [{ source }];
    }
    if (cursor) {
      data.cursor = cursor;
    }

    const result = await this._sdk.post(this._listEndpoint, { data });
    if (result.status === 200) {
      return { edges: result.data.items as EdgeItem[], nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }

  public async queryNodesAndEdges<const T extends Query>(query: T): Promise<QueryResult<T>> {
    const result = await this._sdk.post(this._queryEndpoint, { data: query });
    if (result.status === 200) {
      return { items: result.data.items, nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}
