import { CogniteClient } from '@cognite/sdk';
import {
  ContainerReference,
  ContainerReferenceType,
  IndustryCanvasContainerConfig,
} from '../../types';
import {
  DEFAULT_ASSET_HEIGHT,
  DEFAULT_ASSET_WIDTH,
  DEFAULT_THREE_D_HEIGHT,
  DEFAULT_THREE_D_WIDTH,
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from '../../utils/addDimensionsToContainerReference';
import assertNever from '../../utils/assertNever';
import resolveAssetContainerConfig from './resolveAssetContainerConfig';
import resolveEventContainerConfig from './resolveEventContainerConfig';
import resolveFileContainerConfig from './resolveFileContainerConfig';
import resolveRevealContainerConfig from './resolveRevealContainerConfig';
import resolveTimeseriesContainerConfig from './resolveTimeseriesContainerConfig';

const resolveContainerConfig = async (
  sdk: CogniteClient,
  containerReference: ContainerReference
): Promise<IndustryCanvasContainerConfig> => {
  if (containerReference.type === ContainerReferenceType.FILE) {
    return resolveFileContainerConfig(sdk, {
      id: containerReference.id,
      page: containerReference.page,
      x: containerReference.x,
      y: containerReference.y,
      width: containerReference.width,
      height: containerReference.height,
      maxWidth: containerReference.maxWidth,
      maxHeight: containerReference.maxHeight,
      resourceId: containerReference.resourceId,
      label: containerReference.label,
    });
  }

  if (containerReference.type === ContainerReferenceType.TIMESERIES) {
    return resolveTimeseriesContainerConfig(sdk, {
      id: containerReference.id,
      resourceId: containerReference.resourceId,
      startDate: containerReference.startDate,
      endDate: containerReference.endDate,
      x: containerReference.x,
      y: containerReference.y,
      width: containerReference.width ?? DEFAULT_TIMESERIES_WIDTH,
      height: containerReference.height ?? DEFAULT_TIMESERIES_HEIGHT,
      label: containerReference.label,
    });
  }

  if (containerReference.type === ContainerReferenceType.ASSET) {
    return resolveAssetContainerConfig(sdk, {
      id: containerReference.id,
      resourceId: containerReference.resourceId,
      x: containerReference.x,
      y: containerReference.y,
      width: containerReference.width ?? DEFAULT_ASSET_WIDTH,
      height: containerReference.height ?? DEFAULT_ASSET_HEIGHT,
      label: containerReference.label,
    });
  }

  if (containerReference.type === ContainerReferenceType.EVENT) {
    return resolveEventContainerConfig(sdk, {
      id: containerReference.id,
      resourceId: containerReference.resourceId,
      x: containerReference.x,
      y: containerReference.y,
      width: containerReference.width ?? DEFAULT_ASSET_WIDTH,
      height: containerReference.height ?? DEFAULT_ASSET_HEIGHT,
      label: containerReference.label,
    });
  }

  if (containerReference.type === ContainerReferenceType.THREE_D) {
    return resolveRevealContainerConfig(sdk, {
      id: containerReference.id,
      modelId: containerReference.modelId,
      revisionId: containerReference.revisionId,
      initialAssetId: containerReference.initialAssetId,
      camera: containerReference.camera,
      x: containerReference.x,
      y: containerReference.y,
      width: containerReference.width ?? DEFAULT_THREE_D_WIDTH,
      height: containerReference.height ?? DEFAULT_THREE_D_HEIGHT,
      label: containerReference.label,
    });
  }

  assertNever(containerReference, 'Unsupported container reference type');
};

export default resolveContainerConfig;
