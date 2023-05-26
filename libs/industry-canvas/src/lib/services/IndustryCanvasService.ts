import { v4 as uuid } from 'uuid';

import type { CogniteClient } from '@cognite/sdk';

import { SerializedCanvasDocument } from '../types';
import { FDMClient, gql } from '../utils/FDMClient';
import { UserProfile } from '../hooks/use-query/useUserProfile';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

export class IndustryCanvasService {
  public readonly CANVAS_DATA_SCHEMA_VERSION = 1;
  public readonly SPACE_VERSION = 1;
  public readonly SPACE_EXTERNAL_ID = 'IndustryCanvasNextRelease'; // TODO(marvin): refer to system data model once that's done
  public readonly DATA_MODEL_EXTERNAL_ID = 'IndustryCanvasNextRelease'; // TODO(marvin): refer to system data model once that's done
  public readonly CANVAS_MODEL_NAME = 'Canvas';
  private readonly LIST_LIMIT = 1000; // The max number of items to retrieve in one list request

  private fdmClient: FDMClient;
  private cogniteClient: CogniteClient;
  private userProfile: UserProfile;

  public constructor(client: CogniteClient, userProfile: UserProfile) {
    this.cogniteClient = client;
    this.fdmClient = new FDMClient(client, {
      spaceExternalId: this.SPACE_EXTERNAL_ID,
      spaceVersion: this.SPACE_VERSION,
    });
    this.userProfile = userProfile;
  }

  public async getCanvasById(
    canvasId: string
  ): Promise<SerializedCanvasDocument> {
    const res = await this.fdmClient.graphQL<{
      canvases: { items: SerializedCanvasDocument[] };
    }>(
      gql`
        query GetCanvasById($filter: _List${this.CANVAS_MODEL_NAME}Filter) {
          canvases: list${this.CANVAS_MODEL_NAME}(filter: $filter) {
            items {
              externalId
              name
              version
              isArchived
              createdAt
              createdBy
              updatedAt
              updatedBy
              data
            }
          }
        }
      `,
      this.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            { externalId: { eq: canvasId } },
            { version: { eq: this.CANVAS_DATA_SCHEMA_VERSION } },
          ],
        },
      }
    );
    return res.canvases.items[0];
  }

  private async getPaginatedCanvasData(
    cursor: string | undefined = undefined,
    paginatedData: SerializedCanvasDocument[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<SerializedCanvasDocument[]> {
    // TODO: Check this. Data is fetching. How is serialisation happening here? We don't want to hydrate the configs.
    const res = await this.fdmClient.graphQL<{
      canvases: { items: SerializedCanvasDocument[]; pageInfo: PageInfo };
    }>(
      gql`
        query ListCanvases($filter: _List${this.CANVAS_MODEL_NAME}Filter) {
          canvases: list${this.CANVAS_MODEL_NAME}(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`},
            sort: { createdAt: DESC }
          ) {
            items {
              externalId
              name
              version
              createdAt
              createdBy
              updatedAt
              updatedBy
              data
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
        }
      `,
      this.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            { version: { eq: this.CANVAS_DATA_SCHEMA_VERSION } },
            {
              or: [
                { isArchived: { eq: false } },
                { isArchived: { isNull: true } },
              ],
            },
          ],
        },
      }
    );
    const { items, pageInfo } = res.canvases;

    paginatedData.push(...items);
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedCanvasData(
        pageInfo.startCursor,
        paginatedData,
        limit
      );
    }

    return paginatedData;
  }

  public async listCanvases(): Promise<SerializedCanvasDocument[]> {
    return this.getPaginatedCanvasData();
  }

  public async saveCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    const updatedCanvas: SerializedCanvasDocument = {
      ...canvas,
      updatedBy: this.userProfile.userIdentifier,
      updatedAt: new Date().toISOString(),
    };
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [
      { ...updatedCanvas },
    ]);
    // This will induce an error because timestamps for instance will be incorrect
    return canvas;
  }

  public async archiveCanvas(canvas: SerializedCanvasDocument): Promise<void> {
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [
      { ...canvas, isArchived: true },
    ]);
  }

  public async createCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    const serializedCanvasState: SerializedCanvasDocument = {
      ...canvas,
    };
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [
      serializedCanvasState,
    ]);
    return canvas;
  }

  public async deleteCanvasById(canvasId: string): Promise<void> {
    await this.fdmClient.deleteNodes(canvasId);
  }

  public makeEmptyCanvas = (): SerializedCanvasDocument => {
    return {
      externalId: uuid(),
      name: DEFAULT_CANVAS_NAME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this.userProfile.userIdentifier,
      createdBy: this.userProfile.userIdentifier,
      data: {
        containerReferences: [],
        canvasAnnotations: [],
      },
      version: this.CANVAS_DATA_SCHEMA_VERSION,
    };
  };
}
