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
    return {
      type: ContainerReferenceType.TIMESERIES,
      id: containerConfig.id,
      resourceId: containerConfig.timeseriesId,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      startDate: containerConfig.startDate,
      endDate: containerConfig.endDate,
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

  if (containerType === ContainerType.EVENT) {
    return {
      type: ContainerReferenceType.EVENT,
      id: containerConfig.id,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      resourceId: containerConfig.eventId,
      label: containerConfig.label,
    };
  }

  if (containerType === ContainerType.ASSET) {
    return {
      type: ContainerReferenceType.ASSET,
      id: containerConfig.id,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      resourceId: containerConfig.assetId,
      label: containerConfig.label,
    };
  }

  if (containerConfig.type === ContainerType.FDM_INSTANCE) {
    return {
      type: ContainerReferenceType.FDM_INSTANCE,
      id: containerConfig.id,
      x: containerConfig.x,
      y: containerConfig.y,
      width: containerConfig.width,
      height: containerConfig.height,
      label: containerConfig.label,
      instanceExternalId: containerConfig.instanceExternalId,
      instanceSpace: containerConfig.instanceSpace,
      viewExternalId: containerConfig.viewExternalId,
      viewSpace: containerConfig.viewSpace,
      viewVersion: containerConfig.viewVersion,
    };
  }

  throw new Error(`Unknown container type  ${containerType}`);
};

export default containerConfigToContainerReference;
