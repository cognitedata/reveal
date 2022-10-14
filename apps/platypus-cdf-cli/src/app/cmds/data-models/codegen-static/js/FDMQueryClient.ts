import { CogniteClient } from '@cognite/sdk';
import type { QueryRequest, Query } from './codegen';
import type { ModelNodeMap } from './schema';
import { RelationshipMap } from './schema';
/// <reference path='./codegen.d.ts'/>
import { generateQueryOp } from './codegen.esm.js';
import { FieldsSelection } from '@genql/runtime';

const getTypeKey = (typeName: string, version: number | string) =>
  `${typeName}_${version}`;

const getRelationshipKey = (
  typeName: string,
  attr: string,
  version: number | string
) => `${typeName}_${attr}_${version}`;

const CDF_ALPHA_VERSION_HEADERS = { 'cdf-version': 'alpha' };

export class FDMQueryClient {
  private _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }
  public runQuery = async <R extends QueryRequest>(
    query: R & { __name?: string }
  ) => {
    const response = await this._client.post<{
      data: FieldsSelection<Query, R>;
    }>(
      `/api/v1/projects/${PROJECT}/schema/api/${DM_NAME}/${DM_VERSION}/graphql`,
      { data: generateQueryOp(query) }
    );
    return response;
  };

  public async upsertNodes<T extends keyof ModelNodeMap>(
    key: T,
    items: ModelNodeMap[T][]
  ): Promise<ModelNodeMap[T][]> {
    const data = {
      items: items.map((item) =>
        Object.keys(item).reduce((prev, curKey) => {
          const key = curKey as keyof typeof item;
          const currKeyValue = item[key];
          if (isNodeRef(currKeyValue)) {
            const curNodeRef = currKeyValue as NodeRef;
            return {
              ...prev,
              [curKey]: curNodeRef.buildValue(DM_NAME),
            };
          }
          return { ...prev, [curKey]: item[key] };
        }, {})
      ),
      spaceExternalId: DM_NAME,
      model: [DM_NAME, getTypeKey(key, DM_VERSION)],
      overwrite: true,
    };

    const res = await this._client.post<{ items: ModelNodeMap[T][] }>(
      `/api/v1/projects/${this._client.project}/datamodelstorage/nodes`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
        withCredentials: true,
      }
    );

    return res.data.items;
  }

  public async upsertRelationships<
    I extends { startNode: NodeRef; endNode: NodeRef; externalId?: string },
    K extends keyof typeof RelationshipMap
  >(
    type: K,
    property: keyof typeof RelationshipMap[K],
    items: I[]
  ): Promise<I[]> {
    const relationshipKey = getRelationshipKey(
      type,
      // @ts-ignore
      property,
      DM_VERSION
    );
    const data = {
      items: items.map((el) => ({
        startNode: el.startNode.buildValue(DM_NAME),
        endNode: el.endNode.buildValue(DM_NAME),
        type: [DM_NAME, relationshipKey],
        dummy: '',
        externalId:
          el.externalId ||
          `${el.startNode.externalId}_${el.endNode.externalId}`,
      })),
      spaceExternalId: DM_NAME,
      model: [DM_NAME, relationshipKey],
      overwrite: true,
      autoCreateStartNodes: true,
      autoCreateEndNodes: true,
    };

    const res = await this._client.post<{ items: I[] }>(
      `/api/v1/projects/${this._client.project}/datamodelstorage/edges`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
        withCredentials: true,
      }
    );

    return res.data.items;
  }
  public async deleteNodes<T extends keyof ModelNodeMap>(
    _: T,
    items: string[]
  ): Promise<void> {
    const data = {
      items: items.map((item) => {
        ({
          externalId: item,
        });
      }),
      spaceExternalId: DM_NAME,
      overwrite: true,
    };

    const res = await this._client.post(
      `/api/v1/projects/${this._client.project}/datamodelstorage/nodes/delete`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
        withCredentials: true,
      }
    );

    return res.data;
  }

  public async deleteRelationships<K extends keyof typeof RelationshipMap>(
    _: K,
    _2: keyof typeof RelationshipMap[K],
    items: ({ startNode: NodeRef; endNode: NodeRef } | { externalId: string })[]
  ): Promise<void> {
    const data = {
      items: items.map((el) => ({
        externalId:
          'externalId' in el
            ? el.externalId
            : `${el.startNode.externalId}_${el.endNode.externalId}`,
      })),
      spaceExternalId: DM_NAME,
    };

    const res = await this._client.post(
      `/api/v1/projects/${this._client.project}/datamodelstorage/edges/delete`,
      {
        data,
        headers: CDF_ALPHA_VERSION_HEADERS,
        responseType: 'json',
        withCredentials: true,
      }
    );

    return res.data;
  }
}

export const FDMQueryClientBuilder = {
  fromToken: (appId = 'FDMQueryClient') => {
    return new FDMQueryClient(
      new CogniteClient({
        appId,
        // @ts-ignore
        getToken: () => Promise.resolve(BEARER_TOKEN),
        project: PROJECT,
        baseUrl: `https://${CLUSTER}.cognitedata.com`,
      })
    );
  },
  fromClient: (client: CogniteClient) => {
    return new FDMQueryClient(client);
  },
};

/// <reference path='./codegen.d.ts'/>
export * from './codegen';
export * from './schema';

export class NodeRef {
  externalId: string;
  spaceId?: string;
  constructor(externalId: string, spaceId?: string) {
    this.externalId = externalId;
    this.spaceId = spaceId;
  }
  public buildValue = (defaultSpace: string) => {
    return [this.spaceId || defaultSpace, this.externalId];
  };
  public type = '__NODE_REF';
}

function isNodeRef(item: any): item is NodeRef {
  //magic happens here
  return (
    typeof item === 'object' &&
    'buildValue' in item &&
    'type' in item &&
    item.type === '__NODE_REF'
  );
}
