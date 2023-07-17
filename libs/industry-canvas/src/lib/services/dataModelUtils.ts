import { omit } from 'lodash';

import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceType,
  SerializedCanvasDocument,
  SerializedIndustryCanvasState,
} from '../types';
import { FDMClient } from '../utils/FDMClient';

import { dtoCanvasAnnotationToCanvasAnnotation } from './dtoCanvasAnnotationToCanvasAnnotation';
import { dtoContainerReferenceToContainerReference } from './dtoContainerReferenceToContainerReference';
import { ModelNames } from './IndustryCanvasService';
import {
  DTOCanvasAnnotation,
  DTOCanvasState,
  DTOContainerReference,
} from './types';

export const getSerializedCanvasStateFromDTOCanvasState = ({
  canvasAnnotations: dtoAnnotations,
  containerReferences: dtoContainerReferences,
}: DTOCanvasState): SerializedIndustryCanvasState => ({
  canvasAnnotations:
    dtoAnnotations?.items.map(dtoCanvasAnnotationToCanvasAnnotation) ?? [],
  containerReferences:
    dtoContainerReferences?.items.map(
      dtoContainerReferenceToContainerReference
    ) ?? [],
});

export const getAnnotationOrContainerExternalId = (
  id: string,
  canvasExternalId: string
): string => `${canvasExternalId}_${id}`;

const getDTOCanvasAnnotations = (
  canvasAnnotations: CanvasAnnotation[],
  canvasExternalId: string
): DTOCanvasAnnotation[] => {
  return canvasAnnotations.map((annotation) => {
    const {
      id,
      type,
      containerId,
      isSelectable,
      isDraggable,
      isResizable,
      ...props
    } = annotation;
    return {
      externalId: getAnnotationOrContainerExternalId(id, canvasExternalId),
      id,
      annotationType: type,
      containerId,
      isSelectable,
      isDraggable,
      isResizable,
      properties: props as DTOCanvasAnnotation['properties'],
    };
  });
};

const getResourceIds = (
  ref: ContainerReference
): Pick<DTOContainerReference, 'resourceId' | 'resourceSubId'> => {
  if (ref.type === ContainerReferenceType.THREE_D) {
    return {
      resourceId: ref.modelId,
      resourceSubId: ref.revisionId,
    };
  }
  return {
    resourceId: ref.resourceId,
  };
};

const getDTOContainerReferences = (
  containerReferences: ContainerReference[],
  canvasExternalId: string
): DTOContainerReference[] => {
  return containerReferences.map((containerReference) => {
    const {
      id,
      type,
      label,
      x,
      y,
      width,
      height,
      maxWidth,
      maxHeight,
      ...props
    } = containerReference;
    if (id === undefined) {
      throw new Error(
        'The containerReference id cannot be undefined when upserting to FDM'
      );
    }
    return {
      externalId: getAnnotationOrContainerExternalId(id, canvasExternalId),
      id,
      containerReferenceType: type,
      label,
      x,
      y,
      width,
      height,
      maxWidth,
      maxHeight,
      ...getResourceIds(containerReference),
      properties: omit(props, [
        'resourceId',
        'modelId',
        'revisionId',
      ]) as DTOContainerReference['properties'],
    };
  });
};

const getEdgeExternalId = (
  inNodeExternalId: string,
  outNodeExternalId: string
): string => `${inNodeExternalId}_${outNodeExternalId}`;

export const upsertCanvas = async (
  client: FDMClient,
  canvas: Omit<SerializedCanvasDocument, 'createdTime'>
): Promise<SerializedCanvasDocument> => {
  const {
    data: { canvasAnnotations, containerReferences },
    ...canvasProps
  } = canvas;

  const dtoCanvasAnnotations = getDTOCanvasAnnotations(
    canvasAnnotations,
    canvas.externalId
  );

  const dtoContainerRefs = getDTOContainerReferences(
    containerReferences,
    canvas.externalId
  );

  // We first ingest the nodes, and then the edges, since the start/end
  // nodes must exist *before* the edges can be ingested
  const upsertedNodes = await client.upsertNodes([
    { ...canvasProps, modelName: ModelNames.CANVAS },
    ...dtoCanvasAnnotations.map((annotation) => ({
      ...annotation,
      modelName: ModelNames.CANVAS_ANNOTATION,
    })),
    ...dtoContainerRefs.map((containerRef) => ({
      ...containerRef,
      modelName: ModelNames.CONTAINER_REFERENCE,
    })),
  ]);

  await client.upsertEdges([
    ...dtoCanvasAnnotations.map((annotation) => ({
      externalId: getEdgeExternalId(canvas.externalId, annotation.externalId),
      typeExternalId: `references${ModelNames.CANVAS_ANNOTATION}`,
      startNodeExternalId: canvas.externalId,
      endNodeExternalId: annotation.externalId,
    })),
    ...dtoContainerRefs.map((ref) => ({
      externalId: getEdgeExternalId(canvas.externalId, ref.externalId),
      typeExternalId: `references${ModelNames.CONTAINER_REFERENCE}`,
      startNodeExternalId: canvas.externalId,
      endNodeExternalId: ref.externalId,
    })),
  ]);

  const canvasNodeCreatedTime = upsertedNodes.find(
    (node) => node.externalId === canvas.externalId
  )?.createdTime;
  return {
    ...canvas,
    createdTime:
      canvasNodeCreatedTime === undefined
        ? new Date().toISOString()
        : new Date(canvasNodeCreatedTime).toISOString(),
  };
};
