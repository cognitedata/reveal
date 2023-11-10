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

type SelectKey<T extends Query> = keyof T['select'];
type Sources<T extends Query, K extends SelectKey<T>> = T['select'][K]['sources'][0];
type MainSource<T extends Query, K extends SelectKey<T>> = Sources<T, K>['source'];
type MainSourceProperties<T extends Query, K extends SelectKey<T>> = Sources<T, K>['properties'];

type ResultExpressionProperties<T extends Query, K extends SelectKey<T>> = {
  [V in MainSource<T, K>['space']]: {
    [Q in `${MainSource<T, K>['externalId']}/${MainSource<T, K>['version']}`]: {
      [B in MainSourceProperties<T, K>[number]]: string | number | InstanceIdentifier;
    };
  };
};

type ResultExpression<T extends Query, K extends SelectKey<T>> = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: ResultExpressionProperties<T, K>;
};

type QueryResult<T extends Query> = {
  [K in SelectKey<T>]: ResultExpression<T, K>[];
} & { nextCursor: { [K in SelectKey<T>]: string[] } };

export class DmsSDK {
  private readonly _sdk: CogniteClient;
  private readonly _queryEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    this._queryEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/query`;

    this._sdk = sdk;
  }

  public async queryNodesAndEdges<const T extends Query>(query: T): Promise<QueryResult<T>> {
    const result = await this._sdk.post(this._queryEndpoint, { data: query });
    if (result.status === 200) {
      return { ...result.data.items, nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}
