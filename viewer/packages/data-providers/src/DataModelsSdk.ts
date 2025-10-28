/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Query, QueryNextCursors, QueryResult } from './types';

export class DataModelsSdk {
  private readonly _sdk: CogniteClient;
  private readonly _queryEndpoint: string;

  constructor(sdk: CogniteClient) {
    const baseUrl = sdk.getBaseUrl();
    const project = sdk.project;

    this._queryEndpoint = `${baseUrl}/api/v1/projects/${project}/models/instances/query`;

    this._sdk = sdk;
  }

  public async queryNodesAndEdges<T extends Query>(
    query: T,
    nextCursor?: QueryNextCursors<T>
  ): Promise<QueryResult<T>> {
    const result = await this._sdk.post<{ items: any; nextCursor: any }>(this._queryEndpoint, {
      data: { cursors: nextCursor, ...query }
    });
    if (result.status === 200) {
      return { ...result.data.items, nextCursor: result.data.nextCursor };
    }
    throw new Error(`Failed to fetch instances. Status: ${result.status}`);
  }
}

export function queryNodesAndEdges<T extends Query>(
  dmsSdk: DataModelsSdk,
  query: T,
  nextCursor?: QueryNextCursors<T>
): Promise<QueryResult<T>> {
  return dmsSdk.queryNodesAndEdges<T>(query, nextCursor);
}
