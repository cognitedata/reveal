import { omit } from 'lodash';

import {
  AssetCentricContainerReference,
  CanvasAnnotation,
  ContainerReferenceType,
  FdmInstanceContainerReference,
  SerializedCanvasDocument,
  SerializedIndustryCanvasState,
} from '../types';
import { FDMClient, FDMEdge } from '../utils/FDMClient';

import { dtoAssetCentricContainerReferenceToContainerReference } from './dtoAssetCentricContainerReferenceToContainerReference';
import { dtoCanvasAnnotationToCanvasAnnotation } from './dtoCanvasAnnotationToCanvasAnnotation';
import { dtoFdmInstanceContainerReferenceToFdmInstanceContainerReference } from './dtoFdmInstanceContainerReferenceToFdmInstanceContainerReference';
import { ModelNames } from './IndustryCanvasService';
import {
  DTOCanvasAnnotation,
  DTOCanvasState,
  DTOAssetCentricContainerReference,
  DTOFdmInstanceContainerReference,
} from './types';
import createZIndexByIdRecord from './utils/createZIndexByIdRecord';

export const getSerializedCanvasStateFromDTOCanvasState = ({
  context: dtoContext,
  canvasAnnotations: dtoAnnotations,
  containerReferences: dtoContainerReferences,
  fdmInstanceContainerReferences: dtoFdmInstanceContainerReferences,
}: DTOCanvasState): SerializedIndustryCanvasState => ({
  canvasAnnotations:
    dtoAnnotations?.items.map(dtoCanvasAnnotationToCanvasAnnotation) ?? [],
  containerReferences:
    dtoContainerReferences?.items.map(
      dtoAssetCentricContainerReferenceToContainerReference
    ) ?? [],
  fdmInstanceContainerReferences:
    dtoFdmInstanceContainerReferences?.items.map(
      dtoFdmInstanceContainerReferenceToFdmInstanceContainerReference
    ) ?? [],
  context: dtoContext ?? [],
  zIndexById: createZIndexByIdRecord([
    ...(dtoAnnotations?.items ?? []),
    ...(dtoContainerReferences?.items ?? []),
    ...(dtoFdmInstanceContainerReferences?.items ?? []),
  ]),
});

export const getAnnotationOrContainerExternalId = (
  id: string,
  canvasExternalId: string
): string => `${canvasExternalId}_${id}`;

const getDTOCanvasAnnotations = (
  canvasAnnotations: CanvasAnnotation[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
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
      properties: {
        ...props,
        zIndex: zIndexById[id],
      } as DTOCanvasAnnotation['properties'],
    };
  });
};

const getResourceIds = (
  ref: AssetCentricContainerReference
): Pick<DTOAssetCentricContainerReference, 'resourceId' | 'resourceSubId'> => {
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

const getDTOAssetCentricContainerReferences = (
  containerReferences: AssetCentricContainerReference[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
): DTOAssetCentricContainerReference[] => {
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
      properties: {
        ...omit(props, ['resourceId', 'modelId', 'revisionId']),
        zIndex: zIndexById[id],
      } as DTOAssetCentricContainerReference['properties'],
    };
  });
};

const getDTOFdmInstanceContainerReferences = (
  containerReferences: FdmInstanceContainerReference[],
  canvasExternalId: string,
  zIndexById: Record<string, number | undefined>
): DTOFdmInstanceContainerReference[] => {
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
      instanceExternalId: props.instanceExternalId,
      instanceSpace: props.instanceSpace,
      viewExternalId: props.viewExternalId,
      viewSpace: props.viewSpace,
      viewVersion: props.viewVersion,
      properties: {
        ...omit(props, [
          'instanceExternalId',
          'instanceSpace',
          'viewExternalId',
          'viewSpace',
          'viewVersion',
        ]),
        zIndex: zIndexById[id],
      } as DTOFdmInstanceContainerReference['properties'],
    };
  });
};

const getEdgeExternalId = (
  inNodeExternalId: string,
  outNodeExternalId: string
): string => `${inNodeExternalId}_${outNodeExternalId}`;

const getEdge = <
  StartNodeType extends { externalId: string },
  EndNodeType extends { externalId: string }
>(
  startNode: StartNodeType,
  endNode: EndNodeType,
  modelName: ModelNames
): FDMEdge => ({
  externalId: getEdgeExternalId(startNode.externalId, endNode.externalId),
  typeExternalId: `references${modelName}`,
  startNodeExternalId: startNode.externalId,
  endNodeExternalId: endNode.externalId,
});

export const upsertCanvas = async (
  client: FDMClient,
  canvas: Omit<SerializedCanvasDocument, 'createdTime'>
): Promise<SerializedCanvasDocument> => {
  const {
    data: {
      canvasAnnotations,
      containerReferences,
      fdmInstanceContainerReferences,
      context,
      zIndexById,
    },
    ...canvasProps
  } = canvas;

  const dtoCanvasAnnotations = getDTOCanvasAnnotations(
    canvasAnnotations,
    canvas.externalId,
    zIndexById
  );

  const dtoAssetCentricContainerRefs = getDTOAssetCentricContainerReferences(
    containerReferences,
    canvas.externalId,
    zIndexById
  );

  const dtoFdmInstanceContainerRefs = getDTOFdmInstanceContainerReferences(
    fdmInstanceContainerReferences,
    canvas.externalId,
    zIndexById
  );

  // We first ingest the nodes, and then the edges, since the start/end
  // nodes must exist *before* the edges can be ingested
  const upsertedNodes = await client.upsertNodes([
    { ...canvasProps, context, modelName: ModelNames.CANVAS },
    ...dtoCanvasAnnotations.map((annotation) => ({
      ...annotation,
      modelName: ModelNames.CANVAS_ANNOTATION,
    })),
    ...dtoAssetCentricContainerRefs.map((assetCentricContainerRef) => ({
      ...assetCentricContainerRef,
      modelName: ModelNames.CONTAINER_REFERENCE,
    })),
    ...dtoFdmInstanceContainerRefs.map((fdmContainerRef) => ({
      ...fdmContainerRef,
      modelName: ModelNames.FDM_INSTANCE_CONTAINER_REFERENCE,
    })),
  ]);

  await client.upsertEdges([
    ...dtoCanvasAnnotations.map((annotation) =>
      getEdge(canvas, annotation, ModelNames.CANVAS_ANNOTATION)
    ),
    ...dtoAssetCentricContainerRefs.map((ref) =>
      getEdge(canvas, ref, ModelNames.CONTAINER_REFERENCE)
    ),
    ...dtoFdmInstanceContainerRefs.map((ref) =>
      getEdge(canvas, ref, ModelNames.FDM_INSTANCE_CONTAINER_REFERENCE)
    ),
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
