// This file contains a bare-bones version of
// https://github.com/cognitedata/industry-apps/blob/master/packages/e2e-fdm/src/fdm/fdm-client.ts

import { chunk } from 'lodash';

import type { CogniteClient } from '@cognite/sdk';

export const gql = String.raw;

const UPSERT_CHUNK_SIZE = 1000; // Source: https://developer.cognite.com/api/v1/#tag/Instances/operation/applyNodeAndEdges
const DELETE_CHUNK_SIZE = 1000; // Source: https://developer.cognite.com/api/v1/#tag/Instances/operation/deleteBulk

type NodeOrEdgeDefinition = {
  instanceType: 'node' | 'edge';
  space: string;
  externalId: string;
  wasModified: boolean;
  version: number;
  createdTime?: number;
  lastUpdatedTime?: number;
};

export interface FDMError {
  extensions: { classification: string };
  locations: { column: number; line: number };
  message: string;
}

export type FDMEdge = {
  externalId: string;
  typeExternalId: string;
  startNodeExternalId: string;
  endNodeExternalId: string;
};

/**
 * This class can be used for interactions with CDF
 * You can create your own class that extends from this one
 * and add methods that handle data that is specific to your application.
 */
export class FDMClient {
  public readonly SPACE_EXTERNAL_ID: string;
  public readonly SPACE_VERSION: number;
  private DMS_HEADERS: Record<string, string>;
  protected BASE_URL: string;
  protected client: CogniteClient;

  constructor(
    client: CogniteClient,
    {
      spaceExternalId,
      spaceVersion,
    }: { spaceExternalId: string; spaceVersion: number }
  ) {
    this.SPACE_EXTERNAL_ID = spaceExternalId;
    this.SPACE_VERSION = spaceVersion;
    this.client = client;
    this.BASE_URL = `${this.client.getBaseUrl()}/api/v1/projects/${
      this.client.project
    }`;
    this.DMS_HEADERS = { 'cdf-version': 'alpha' };
  }

  private get baseUrlDms(): string {
    return `${this.BASE_URL}/models/instances`;
  }

  private get baseUrlDmsEdges(): string {
    return `${this.BASE_URL}/models/instances`;
  }

  private getGraphQLBaseURL(dataModelId: string): string {
    return `${this.BASE_URL}/userapis/spaces/${this.SPACE_EXTERNAL_ID}/datamodels/${dataModelId}/versions/${this.SPACE_VERSION}/graphql`;
  }

  public async graphQL<T>(
    query: string,
    dataModelId: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const res = await this.client.post<{ data: T; errors?: FDMError[] }>(
      this.getGraphQLBaseURL(dataModelId),
      {
        data: {
          query,
          variables,
        },
      }
    );
    if (res.data.errors !== undefined) {
      const { errors } = res.data;
      throw new Error(
        errors.length > 0
          ? JSON.stringify(errors.map((error) => error.message))
          : 'Error connecting to server'
      );
    }
    return res.data.data;
  }

  private async chunkedPostRequest<
    NodeOrEdgeReference extends { externalId?: string; space: string },
    ResponseDataType = NodeOrEdgeDefinition
  >(
    url: string,
    items: NodeOrEdgeReference[],
    chunkSize: number,
    properties: Record<string, any> = {}
  ): Promise<ResponseDataType[]> {
    const chunkedItems = chunk(items, chunkSize);
    const responseItemsPerChunk = await Promise.all(
      chunkedItems.map(async (items) => {
        const response = await this.client.post<{ items: ResponseDataType[] }>(
          url,
          {
            data: { items, ...properties },
            headers: this.DMS_HEADERS,
            withCredentials: true,
          }
        );
        return response.data.items;
      })
    );
    return responseItemsPerChunk.flat();
  }

  public async upsertNodes<
    T extends { modelName: string; externalId?: string; viewVersion?: string }
  >(nodes: T[]): Promise<NodeOrEdgeDefinition[]> {
    if (nodes.length === 0) {
      return [];
    }
    const upsertedNodes = await this.chunkedPostRequest(
      this.baseUrlDms,
      nodes.map(({ externalId, modelName, viewVersion, ...properties }) => ({
        instanceType: 'node',
        space: this.SPACE_EXTERNAL_ID,
        externalId,
        sources: [
          viewVersion !== undefined
            ? {
                source: {
                  type: 'view',
                  space: this.SPACE_EXTERNAL_ID,
                  externalId: modelName,
                  version: viewVersion,
                },
                properties,
              }
            : {
                source: {
                  type: 'container',
                  space: this.SPACE_EXTERNAL_ID,
                  externalId: modelName,
                },
                properties,
              },
        ],
      })),
      UPSERT_CHUNK_SIZE
    );
    return upsertedNodes;
  }

  public async deleteNodes(
    externalIds: string[] | string
  ): Promise<NodeOrEdgeDefinition[]> {
    const externalIdsAsArray = Array.isArray(externalIds)
      ? externalIds
      : [externalIds];
    if (externalIdsAsArray.length === 0) {
      return [];
    }
    const deletedNodes = this.chunkedPostRequest(
      `${this.baseUrlDms}/delete`,
      externalIdsAsArray.map((externalId) => ({
        instanceType: 'node',
        space: this.SPACE_EXTERNAL_ID,
        externalId,
      })),
      DELETE_CHUNK_SIZE
    );
    return deletedNodes;
  }

  public async upsertEdges(edges: FDMEdge[]): Promise<NodeOrEdgeDefinition[]> {
    if (edges.length === 0) {
      return [];
    }
    const upsertedEdges = this.chunkedPostRequest(
      this.baseUrlDmsEdges,
      edges.map(
        ({
          externalId,
          typeExternalId,
          startNodeExternalId,
          endNodeExternalId,
        }) => ({
          instanceType: 'edge',
          space: this.SPACE_EXTERNAL_ID,
          externalId,
          type: {
            space: this.SPACE_EXTERNAL_ID,
            externalId: typeExternalId,
          },
          startNode: {
            space: this.SPACE_EXTERNAL_ID,
            externalId: startNodeExternalId,
          },
          endNode: {
            space: this.SPACE_EXTERNAL_ID,
            externalId: endNodeExternalId,
          },
        })
      ),
      UPSERT_CHUNK_SIZE,
      {
        autoCreateStartNodes: false,
        autoCreateEndNodes: false,
        skipOnVersionConflict: false,
        replace: false,
      }
    );
    return upsertedEdges;
  }
}
