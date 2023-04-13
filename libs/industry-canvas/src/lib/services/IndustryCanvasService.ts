import type { CogniteClient } from '@cognite/sdk';
import { v4 as uuid } from 'uuid';

import { PersistedCanvasState } from '../types';
import { FDMClient, gql } from '../utils/FDMClient';
import { deserializeCanvasState } from '../utils/utils';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

export class IndustryCanvasService {
  public readonly CANVAS_DATA_SCHEMA_VERSION = 1;
  public readonly SPACE_VERSION = 2;
  public readonly SPACE_EXTERNAL_ID = 'IndustryCanvas';
  public readonly DATA_MODEL_EXTERNAL_ID = 'Industry_Canvas';
  public readonly CANVAS_MODEL_NAME = 'Canvas';
  private readonly LIST_LIMIT = 1000; // The max number of items to retrieve in one list request

  private fdmClient: FDMClient;

  public constructor(client: CogniteClient) {
    this.fdmClient = new FDMClient(client, {
      spaceExternalId: this.SPACE_EXTERNAL_ID,
      spaceVersion: this.SPACE_VERSION,
    });
  }

  public async getCanvasById(canvasId: string): Promise<PersistedCanvasState> {
    const res = await this.fdmClient.graphQL<{
      canvases: { items: PersistedCanvasState[] };
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
              updatedAt
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
    return deserializeCanvasState(res.canvases.items[0]);
  }

  private async getPaginatedCanvasData(
    cursor: string | undefined = undefined,
    paginatedData: PersistedCanvasState[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<PersistedCanvasState[]> {
    const res = await this.fdmClient.graphQL<{
      canvases: { items: PersistedCanvasState[]; pageInfo: PageInfo };
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
              updatedAt
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

  public async listCanvases(): Promise<PersistedCanvasState[]> {
    return this.getPaginatedCanvasData();
  }

  public async saveCanvas(
    canvas: PersistedCanvasState
  ): Promise<PersistedCanvasState> {
    const updatedCanvas = {
      ...canvas,
      updatedAt: new Date().toISOString(),
    };
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [
      { ...updatedCanvas },
    ]);
    return updatedCanvas;
  }

  public async archiveCanvas(canvas: PersistedCanvasState): Promise<void> {
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [
      { ...canvas, isArchived: true },
    ]);
  }

  public async createCanvas(
    canvas: PersistedCanvasState
  ): Promise<PersistedCanvasState> {
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [{ ...canvas }]);
    return canvas;
  }

  public async deleteCanvasById(canvasId: string): Promise<void> {
    await this.fdmClient.deleteNodes(canvasId);
  }

  public makeEmptyCanvas = (): PersistedCanvasState => {
    return {
      externalId: uuid(),
      name: DEFAULT_CANVAS_NAME,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        containerReferences: [],
        canvasAnnotations: [],
      },
      version: this.CANVAS_DATA_SCHEMA_VERSION,
    };
  };
}
