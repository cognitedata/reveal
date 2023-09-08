import { omit } from 'lodash';

import type { CogniteClient } from '@cognite/sdk';
import { IdsByType } from '@cognite/unified-file-viewer';

import { CanvasMetadata, SerializedCanvasDocument } from '../types';
import { UserProfile } from '../UserProfileProvider';
import { createSerializedCanvasDocument } from '../utils/createSerializedCanvasDocument';
import { FDMClient, gql } from '../utils/FDMClient';

import {
  getAnnotationOrContainerExternalId,
  getSerializedCanvasStateFromDTOCanvasState,
  upsertCanvas,
} from './dataModelUtils';
import { DTOCanvasState } from './types';
import { getVisibilityFilter } from './utils';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

export enum ModelNames {
  CANVAS = 'Canvas',
  CONTAINER_REFERENCE = 'ContainerReference',
  FDM_INSTANCE_CONTAINER_REFERENCE = 'FdmInstanceContainerReference',
  CANVAS_ANNOTATION = 'CanvasAnnotation',
}

export enum CanvasVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  ALL = 'all',
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
  public static readonly SYSTEM_SPACE = 'cdf_industrial_canvas';
  // Note: To simplify the code, we assume that the data models and
  // the views in the system space always have the same version.
  public static readonly SYSTEM_SPACE_VERSION = 'v4';
  public static readonly INSTANCE_SPACE = 'IndustrialCanvasInstanceSpace';
  public static readonly DATA_MODEL_EXTERNAL_ID = 'IndustrialCanvas';
  private readonly LIST_LIMIT = 1000; // The max number of items to retrieve in one list request

  private fdmClient: FDMClient;
  private cogniteClient: CogniteClient;
  private userProfile: UserProfile;

  public constructor(client: CogniteClient, userProfile: UserProfile) {
    this.cogniteClient = client;
    this.fdmClient = new FDMClient(client, {
      systemSpace: IndustryCanvasService.SYSTEM_SPACE,
      systemSpaceVersion: IndustryCanvasService.SYSTEM_SPACE_VERSION,
      instanceSpace: IndustryCanvasService.INSTANCE_SPACE,
    });
    this.userProfile = userProfile;
  }

  public async getCanvasById(
    canvasExternalId: string
  ): Promise<SerializedCanvasDocument> {
    const res = await this.fdmClient.graphQL<{
      canvases: {
        items: (Omit<SerializedCanvasDocument, 'data'> & DTOCanvasState)[];
      };
    }>(
      // TODO(DEGR-2457): add support for paginating through containerReferences and canvasAnnotations
      gql`
        query GetCanvasById {
          canvases: getCanvasById(
            instance: {
              space: "${IndustryCanvasService.INSTANCE_SPACE}",
              externalId: "${canvasExternalId}"
            }
          ) {
            items {
              externalId
              name
              visibility
              isArchived
              createdTime
              createdBy
              updatedAt
              updatedBy
              context
              containerReferences (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  containerReferenceType
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
              fdmInstanceContainerReferences (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  containerReferenceType
                  instanceExternalId
                  instanceSpace
                  viewExternalId
                  viewSpace
                  viewVersion
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
                  annotationType
                  containerId
                  isSelectable
                  isDraggable
                  isResizable
                  properties
                }
              }
            }
          }
        }
      `,
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID
    );
    if (res.canvases.items.length === 0) {
      throw new Error(
        `Couldn't find canvas with external id ${canvasExternalId}`
      );
    }

    if (res.canvases.items.length > 1) {
      throw new Error(
        `Found multiple canvases with external id '${canvasExternalId}' in the space '${IndustryCanvasService.INSTANCE_SPACE}'. This shouldn't happen.`
      );
    }

    const dtoCanvas = res.canvases.items[0];
    return {
      ...omit(dtoCanvas, [
        'canvasAnnotations',
        'containerReferences',
        'fdmInstanceContainerReferences',
        'context',
      ]),
      data: getSerializedCanvasStateFromDTOCanvasState({
        context: dtoCanvas.context,
        containerReferences: dtoCanvas.containerReferences,
        canvasAnnotations: dtoCanvas.canvasAnnotations,
        fdmInstanceContainerReferences:
          dtoCanvas.fdmInstanceContainerReferences,
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
              visibility
              createdTime
              createdBy
              updatedAt
              updatedBy
            }
          }
        }
      `,
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            { externalId: { eq: canvasId } },
            {
              space: {
                eq: IndustryCanvasService.INSTANCE_SPACE,
              },
            },
          ],
        },
      }
    );
    if (res.canvases.items.length === 0) {
      throw new Error(`Couldn't find canvas with id ${canvasId}`);
    }

    return res.canvases.items[0];
  }

  public async listCanvases({
    visibility,
  }: {
    visibility: CanvasVisibility;
  }): Promise<SerializedCanvasDocument[]> {
    return this.getPaginatedCanvasData({ visibilityFilter: visibility });
  }

  // TODO: This methods says that is returns a full SerializedCanvasDocument, but it doesn't doesn't include the `data` field.
  private async getPaginatedCanvasData({
    cursor = undefined,
    paginatedData = [],
    limit = this.LIST_LIMIT,
    visibilityFilter,
  }: {
    cursor?: string;
    paginatedData?: SerializedCanvasDocument[];
    limit?: number;
    visibilityFilter: CanvasVisibility;
  }): Promise<SerializedCanvasDocument[]> {
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
            sort: { updatedAt: DESC }
          ) {
            items {
              externalId
              name
              visibility
              createdTime
              createdBy
              updatedAt
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
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            getVisibilityFilter({
              userProfile: this.userProfile,
              visibilityFilter,
            }),
            {
              or: [
                { isArchived: { eq: false } },
                { isArchived: { isNull: true } },
              ],
            },
            {
              space: {
                eq: IndustryCanvasService.INSTANCE_SPACE,
              },
            },
          ],
        },
      }
    );

    const { items, pageInfo } = res.canvases;

    paginatedData.push(...items);
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedCanvasData({
        cursor: pageInfo.endCursor,
        paginatedData,
        limit,
        visibilityFilter,
      });
    }

    return paginatedData;
  }

  public async saveCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    const updatedCanvas: SerializedCanvasDocument = {
      ...canvas,
      updatedBy: this.userProfile.userIdentifier,
      updatedAt: new Date().toISOString(),
    };
    await upsertCanvas(
      this.fdmClient,
      omitCreatedTimeFromSerializedCanvas(updatedCanvas)
    );
    // This will induce an error because timestamps for instance will be incorrect
    return updatedCanvas;
  }

  public async archiveCanvas(externalId: string): Promise<void> {
    await this.fdmClient.upsertNodes([
      {
        modelName: ModelNames.CANVAS,
        externalId,
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
    return createSerializedCanvasDocument(this.userProfile.userIdentifier);
  };
}
