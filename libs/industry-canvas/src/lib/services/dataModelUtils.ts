import { omit } from 'lodash';

import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceType,
  SerializedCanvasDocument,
  SerializedIndustryCanvasState,
} from '../types';
import { FDMClient } from '../utils/FDMClient';

import { fdmCanvasAnnotationToCanvasAnnotation } from './fdmCanvasAnnotationToCanvasAnnotation';
import { fdmContainerReferenceToContainerReference } from './fdmContainerReferenceToContainerReference';
import { ModelNames } from './IndustryCanvasService';
import {
  FDMCanvasAnnotation,
  FDMCanvasState,
  FDMContainerReference,
} from './types';

export const getSerializedCanvasStateFromFDMCanvasState = ({
  canvasAnnotations: fdmAnnotations,
  containerReferences: fdmContainerReferences,
}: FDMCanvasState): SerializedIndustryCanvasState => ({
  canvasAnnotations:
    fdmAnnotations?.items.map(fdmCanvasAnnotationToCanvasAnnotation) ?? [],
  containerReferences:
    fdmContainerReferences?.items.map(
      fdmContainerReferenceToContainerReference
    ) ?? [],
});

export const getAnnotationOrContainerExternalId = (
  id: string,
  canvasExternalId: string
): string => `${canvasExternalId}_${id}`;

const getFDMCanvasAnnotations = (
  canvasAnnotations: CanvasAnnotation[],
  canvasExternalId: string
): FDMCanvasAnnotation[] => {
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
      properties: props as FDMCanvasAnnotation['properties'],
    };
  });
};

const getResourceIds = (
  ref: ContainerReference
): Pick<FDMContainerReference, 'resourceId' | 'resourceSubId'> => {
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

const getFDMContainerReferences = (
  containerReferences: ContainerReference[],
  canvasExternalId: string
): FDMContainerReference[] => {
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
      ]) as FDMContainerReference['properties'],
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

  const fdmCanvasAnnotations = getFDMCanvasAnnotations(
    canvasAnnotations,
    canvas.externalId
  );

  const fdmContainerRefs = getFDMContainerReferences(
    containerReferences,
    canvas.externalId
  );

  // We first ingest the nodes, and then the edges, since the start/end
  // nodes must exist *before* the edges can be ingested
  const upsertedNodes = await client.upsertNodes([
    { ...canvasProps, modelName: ModelNames.CANVAS },
    ...fdmCanvasAnnotations.map((annotation) => ({
      ...annotation,
      modelName: ModelNames.CANVAS_ANNOTATION,
    })),
    ...fdmContainerRefs.map((containerRef) => ({
      ...containerRef,
      modelName: ModelNames.CONTAINER_REFERENCE,
    })),
  ]);

  // TODO(marvin): use the system data model type external ids once system data models are working
  await client.upsertEdges([
    ...fdmCanvasAnnotations.map((annotation) => ({
      externalId: getEdgeExternalId(canvas.externalId, annotation.externalId),
      //typeExternalId: `references${ModelNames.CANVAS_ANNOTATION}`,
      typeExternalId: `${ModelNames.CANVAS}.canvasAnnotations`,
      startNodeExternalId: canvas.externalId,
      endNodeExternalId: annotation.externalId,
    })),
    ...fdmContainerRefs.map((ref) => ({
      externalId: getEdgeExternalId(canvas.externalId, ref.externalId),
      // typeExternalId: `references${ModelNames.CONTAINER_REFERENCE}`,
      typeExternalId: `${ModelNames.CANVAS}.containerReferences`,
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
