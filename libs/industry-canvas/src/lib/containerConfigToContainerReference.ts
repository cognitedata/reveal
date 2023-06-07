import { ContainerType } from '@cognite/unified-file-viewer';

import {
  ContainerReference,
  ContainerReferenceType,
  IndustryCanvasContainerConfig,
} from './types';

const containerConfigToContainerReference = (
  containerConfig: IndustryCanvasContainerConfig
): ContainerReference => {
  const containerType = containerConfig.type;
  if (
    containerType === ContainerType.IMAGE ||
    containerType === ContainerType.DOCUMENT ||
    containerType === ContainerType.TEXT
  ) {
    if (containerConfig.metadata.resourceId === undefined) {
      throw new Error('resourceId is undefined');
    }

    return {
      type: ContainerReferenceType.FILE,
      id: containerConfig.id,
      resourceId: containerConfig.metadata.resourceId,
      page:
        containerType === ContainerType.DOCUMENT
          ? containerConfig?.page ?? 1
          : 1,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      maxWidth: containerConfig.maxWidth,
      maxHeight: containerConfig.maxHeight,
      label: containerConfig.label,
    };
  }

  if (containerType === ContainerType.TIMESERIES) {
    if (containerConfig.metadata.resourceId === undefined) {
      throw new Error('resourceId is undefined');
    }

    return {
      type: ContainerReferenceType.TIMESERIES,
      id: containerConfig.id,
      resourceId: containerConfig.metadata.resourceId,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      startDate: containerConfig.startDate.toISOString(),
      endDate: containerConfig.endDate.toISOString(),
      label: containerConfig.label,
    };
  }

  if (containerType === ContainerType.REVEAL) {
    return {
      type: ContainerReferenceType.THREE_D,
      id: containerConfig.id,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      modelId: containerConfig.modelId,
      revisionId: containerConfig.revisionId,
      initialAssetId: containerConfig.initialAssetId,
      camera: containerConfig.camera,
      label: containerConfig.label,
    };
  }

  if (containerType === ContainerType.TABLE) {
    if (containerConfig.metadata.resourceId === undefined) {
      throw new Error('resourceId is undefined');
    }
    if (
      containerConfig.metadata.resourceType !== 'event' &&
      containerConfig.metadata.resourceType !== 'asset'
    ) {
      throw new Error('resourceType must be one of asset and event');
    }

    return {
      type:
        containerConfig.metadata.resourceType === 'asset'
          ? ContainerReferenceType.ASSET
          : ContainerReferenceType.EVENT,
      id: containerConfig.id,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      resourceId: containerConfig.metadata.resourceId,
      label: containerConfig.label,
    };
  }

  throw new Error(`Unknown container type  ${containerType}`);
};

export default containerConfigToContainerReference;
