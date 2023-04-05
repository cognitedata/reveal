import type { CogniteClient } from '@cognite/sdk';
import { v4 as uuid } from 'uuid';

import { PersistedCanvasState } from '../types';
import { FDMClient, gql } from '../utils/FDMClient';
import { deserializeCanvasState } from '../utils/utils';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

export class IndustryCanvasService {
  public readonly CANVAS_DATA_SCHEMA_VERSION = 1;
  public readonly SPACE_VERSION = 1;
  public readonly SPACE_EXTERNAL_ID = 'IndustryCanvas';
  public readonly DATA_MODEL_EXTERNAL_ID = 'Industry_Canvas';
  public readonly CANVAS_MODEL_NAME = 'Canvas';

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
        query ListCanvases($filter: _List${this.CANVAS_MODEL_NAME}Filter) {
          canvases: list${this.CANVAS_MODEL_NAME}(filter: $filter) {
            items {
              externalId
              name
              version
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
    const canvasState = res.canvases.items[0];
    const deserializedData = deserializeCanvasState(canvasState.data);
    return {
      ...canvasState,
      data: {
        ...deserializedData,
      },
    };
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

  public async createCanvas(
    canvas: PersistedCanvasState
  ): Promise<PersistedCanvasState> {
    await this.fdmClient.upsertNodes(this.CANVAS_MODEL_NAME, [{ ...canvas }]);
    return canvas;
  }

  // TODO: implement
  public async deleteCanvas(canvasId: string): Promise<void> {}

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
