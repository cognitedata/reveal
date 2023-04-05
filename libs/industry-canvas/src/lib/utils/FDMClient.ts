// This file contains a bare-bones version of
// https://github.com/cognitedata/industry-apps/blob/master/packages/e2e-fdm/src/fdm/fdm-client.ts

import type { CogniteClient } from '@cognite/sdk';

export const gql = String.raw;

export interface FDMError {
  extensions: { classification: string };
  locations: { column: number; line: number };
  message: string;
}

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
    return this.client
      .post<{ data: T; errors: FDMError[] }>(
        this.getGraphQLBaseURL(dataModelId),
        {
          data: {
            query,
            variables,
          },
        }
      )
      .then((res) => {
        if (res.data.errors) {
          const { errors } = res.data;
          throw new Error(
            errors.length > 0
              ? JSON.stringify(errors.map((error) => error.message))
              : 'Error connecting to server'
          );
        }
        return res.data.data;
      });
  }

  public async upsertNodes<T extends { externalId?: string }>(
    modelName: string,
    nodes: T[]
  ) {
    const data = {
      items: nodes.map(({ externalId, ...properties }) => ({
        instanceType: 'node',
        space: this.SPACE_EXTERNAL_ID,
        externalId,
        sources: [
          {
            source: {
              type: 'container',
              space: this.SPACE_EXTERNAL_ID,
              externalId: modelName,
            },
            properties,
          },
        ],
      })),
    };
    return this.client.post<{ items: T[] }>(this.baseUrlDms, {
      data,
      headers: this.DMS_HEADERS,
      withCredentials: true,
    });
  }

  public async deleteNodes(externalIds: string[] | string) {
    const externalIdsAsArray = Array.isArray(externalIds)
      ? externalIds
      : [externalIds];
    const data = {
      items: externalIdsAsArray.map((externalId) => ({
        instanceType: 'node',
        space: this.SPACE_EXTERNAL_ID,
        externalId,
      })),
    };
    return this.client.post(`${this.baseUrlDms}/delete`, {
      data,
      headers: this.DMS_HEADERS,
      withCredentials: true,
    });
  }
}
