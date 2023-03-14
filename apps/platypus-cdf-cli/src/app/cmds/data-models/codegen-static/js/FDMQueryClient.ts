import { CogniteClient } from '@cognite/sdk';
import {
  FieldsSelection,
  generateGraphqlOperation,
  linkTypeMap,
} from './runtime';
import type { ModelNodeMap, Query, QueryGenqlSelection } from './schema';
import { RelationshipMap, TypeProperties, DirectProperties } from './schema';

import types from './types';
const typeMap = linkTypeMap(types as any);

const getRelationshipKey = (typeName: string, attr: string) =>
  `${typeName}.${attr}`;

const CDF_ALPHA_VERSION_HEADERS = { 'cdf-version': 'alpha' };

export class FDMQueryClient {
  private _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }
  public runQuery = async <R extends QueryGenqlSelection>(
    query: R & { __name?: string }
  ) => {
    const response = await this._client.post<{
      data: FieldsSelection<Query, R>;
    }>(ENDPOINT, {
      data: generateGraphqlOperation('query', typeMap.Query!, query as any),
    });
    return response;
  };

  public async upsertNodes<T extends keyof ModelNodeMap>(
    key: T,
    items: ModelNodeMap[T][]
  ): Promise<ModelNodeMap[T][]> {
    const data = {
      items: items.map((item) => ({
        instanceType: 'node',
        space: SPACE,
        externalId: item.externalId,
        sources: [
          {
            source: {
              type: 'view',
              space: SPACE,
              externalId: key,
              version: DM_VERSION,
            },
            properties: DirectProperties[key].reduce(
              (prev, curKey) => {
                const key = curKey as keyof typeof item;
                return {
                  ...prev,
                  [curKey]: { space: SPACE, ...item[key] },
                };
              },
              TypeProperties[key].reduce((prev, curKey) => {
                const key = curKey as keyof typeof item;
                return { ...prev, [curKey]: item[key] };
              }, {} as any) as any
            ),
          },
        ],
      })),
      replace: true,
      autoCreateStartNodes: true,
      autoCreateEndNodes: true,
    };

    const res = await this._client.post<{ items: ModelNodeMap[T][] }>(
      `/api/v1/projects/${this._client.project}/models/instances`,
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
    I extends {
      startNode: { externalId: string; space?: string };
      endNode: { externalId: string; space?: string };
      externalId?: string;
    },
    K extends keyof typeof RelationshipMap
  >(
    type: K,
    property: keyof (typeof RelationshipMap)[K],
    items: I[]
  ): Promise<I[]> {
    const relationshipKey = getRelationshipKey(
      type,
      // @ts-ignore
      property
    );
    const data = {
      items: items.map((el) => ({
        instanceType: 'edge',
        space: SPACE,
        startNode: {
          externalId: el.startNode.externalId,
          space: el.startNode.space || SPACE,
        },
        endNode: {
          externalId: el.endNode.externalId,
          space: el.endNode.space || SPACE,
        },
        type: { space: SPACE, externalId: relationshipKey },
        externalId:
          el.externalId ||
          `${el.startNode.externalId}_${el.endNode.externalId}`,
      })),
      replace: true,
      autoCreateStartNodes: true,
      autoCreateEndNodes: true,
    };

    const res = await this._client.post<{ items: I[] }>(
      `/api/v1/projects/${this._client.project}/models/instances`,
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
      items: items.map((item) => ({
        instanceType: 'node',
        externalId: item,
        space: SPACE,
      })),
    };

    const res = await this._client.post(
      `/api/v1/projects/${this._client.project}/models/instances/delete`,
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
    _2: keyof (typeof RelationshipMap)[K],
    items: (
      | {
          startNode: { externalId: string; space?: string };
          endNode: { externalId: string; space?: string };
        }
      | { externalId: string }
    )[]
  ): Promise<void> {
    const data = {
      items: items.map((el) => ({
        instanceType: 'edge',
        externalId:
          'externalId' in el
            ? el.externalId
            : `${el.startNode.externalId}_${el.endNode.externalId}`,
        space: SPACE,
      })),
    };

    const res = await this._client.post(
      `/api/v1/projects/${this._client.project}/models/instances/delete`,
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
