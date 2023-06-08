import { omit } from 'lodash';
import { v4 as uuid } from 'uuid';

import type { CogniteClient } from '@cognite/sdk';
import { IdsByType } from '@cognite/unified-file-viewer';

import { UserProfile } from '../hooks/use-query/useUserProfile';
import { CanvasMetadata, SerializedCanvasDocument } from '../types';
import { FDMClient, gql } from '../utils/FDMClient';

import {
  getAnnotationOrContainerExternalId,
  getSerializedCanvasStateFromFDMCanvasState,
  upsertCanvas,
} from './dataModelUtils';
import { FDMCanvasState } from './types';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

export enum ModelNames {
  CANVAS = 'Canvas',
  CONTAINER_REFERENCE = 'ContainerReference',
  CANVAS_ANNOTATION = 'CanvasAnnotation',
}

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

// NOTE: We manually omit createdTime from our Canvas type, since it's supplied
// by FDM and we can't update it manually
const omitCreatedTimeFromSerializedCanvas = (
  canvas: SerializedCanvasDocument
): Omit<SerializedCanvasDocument, 'createdTime'> =>
  omit(canvas, ['createdTime']);

export class IndustryCanvasService {
  public readonly SPACE_VERSION = 1;
  public readonly SPACE_EXTERNAL_ID = 'MarvinV5'; // TODO(marvin): fix once data model is verified
  public readonly DATA_MODEL_EXTERNAL_ID = 'IndustryCanvasV5'; // TODO(marvin): fix once data model is verified
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
      canvases: {
        items: (Omit<SerializedCanvasDocument, 'data'> & FDMCanvasState)[];
      };
    }>(
      // TODO(DEGR-2457): add support for paginating through containerReferences and canvasAnnotations
      gql`
        query GetCanvasById($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: listCanvas(filter: $filter) {
            items {
              externalId
              name
              isArchived
              createdTime
              createdBy
              updatedTime
              updatedBy
              containerReferences (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  type
                  resourceId
                  resourceSubId
                  label
                  properties
                  width
                  height
                  maxWidth
                  maxHeight
                  x
                  y
                }
              }
              canvasAnnotations (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  type
                  containerId
                  isSelectable
                  isDraggable
                  isResizable
                  properties
                  metadata
                }
              }
            }
          }
        }
      `,
      this.DATA_MODEL_EXTERNAL_ID,
      { filter: { externalId: { eq: canvasId } } }
    );
    if (res.canvases.items.length === 0) {
      throw new Error(`Couldn't find canvas with id ${canvasId}`);
    }

    const fdmCanvas = res.canvases.items[0];
    return {
      ...omit(fdmCanvas, ['canvasAnnotations', 'containerReferences']),
      data: getSerializedCanvasStateFromFDMCanvasState({
        containerReferences: fdmCanvas.containerReferences,
        canvasAnnotations: fdmCanvas.canvasAnnotations,
      }),
    };
  }

  public async getCanvasMetadataById(
    canvasId: string
  ): Promise<CanvasMetadata> {
    const res = await this.fdmClient.graphQL<{
      canvases: {
        items: CanvasMetadata[];
      };
    }>(
      gql`
        query GetCanvasById($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: listCanvas(filter: $filter) {
            items {
              externalId
              name
              isArchived
              createdTime
              createdBy
              updatedTime
              updatedBy
            }
          }
        }
      `,
      this.DATA_MODEL_EXTERNAL_ID,
      { filter: { externalId: { eq: canvasId } } }
    );
    if (res.canvases.items.length === 0) {
      throw new Error(`Couldn't find canvas with id ${canvasId}`);
    }

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
        query ListCanvases($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: list${ModelNames.CANVAS}(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`},
            sort: { updatedTime: DESC }
          ) {
            items {
              externalId
              name
              createdTime
              createdBy
              updatedTime
              updatedBy
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
          or: [{ isArchived: { eq: false } }, { isArchived: { isNull: true } }],
        },
      }
    );
    const { items, pageInfo } = res.canvases;

    paginatedData.push(...items);
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedCanvasData(
        pageInfo.endCursor,
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
      updatedTime: new Date().toISOString(),
    };
    await upsertCanvas(
      this.fdmClient,
      omitCreatedTimeFromSerializedCanvas(updatedCanvas)
    );
    // This will induce an error because timestamps for instance will be incorrect
    return updatedCanvas;
  }

  public async archiveCanvas(canvas: SerializedCanvasDocument): Promise<void> {
    await this.fdmClient.upsertNodes([
      {
        modelName: ModelNames.CANVAS,
        ...omit(canvas, ['data', 'createdTime']),
        isArchived: true,
      },
    ]);
  }

  public async createCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    return await upsertCanvas(
      this.fdmClient,
      omitCreatedTimeFromSerializedCanvas(canvas)
    );
  }

  public async deleteCanvasById(canvasId: string): Promise<void> {
    await this.fdmClient.deleteNodes(canvasId);
  }

  public async deleteCanvasIdsByType(
    ids: IdsByType,
    canvasId: string
  ): Promise<void> {
    await this.fdmClient.deleteNodes(
      [...ids.annotationIds, ...ids.containerIds].map((id) =>
        getAnnotationOrContainerExternalId(id, canvasId)
      )
    );
  }

  public makeEmptyCanvas = (): SerializedCanvasDocument => {
    return {
      externalId: uuid(),
      name: DEFAULT_CANVAS_NAME,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
      updatedBy: this.userProfile.userIdentifier,
      createdBy: this.userProfile.userIdentifier,
      data: {
        containerReferences: [],
        canvasAnnotations: [],
      },
    };
  };
}
