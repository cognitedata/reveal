import { ContainerReference, ContainerReferenceType } from '../../types';
import assertNever from '../assertNever';

export const DEFAULT_CONTAINER_MAX_WIDTH = 1000;
export const DEFAULT_CONTAINER_MAX_HEIGHT = 1000;
export const DEFAULT_TIMESERIES_HEIGHT = 400;
export const DEFAULT_TIMESERIES_WIDTH = 700;
export const DEFAULT_ASSET_WIDTH = 600;
export const DEFAULT_ASSET_HEIGHT = 500;
export const DEFAULT_EVENT_WIDTH = 600;
export const DEFAULT_EVENT_HEIGHT = 500;
export const DEFAULT_THREE_D_WIDTH = 600;
export const DEFAULT_THREE_D_HEIGHT = 400;
export const DEFAULT_FDM_INSTANCE_WIDTH = 600;
export const DEFAULT_FDM_INSTANCE_HEIGHT = 500;

export const getInitialContainerReferenceSize = (
  containerReference: ContainerReference
) => {
  const containerReferenceType = containerReference.type;
  if (containerReferenceType === ContainerReferenceType.FILE) {
    return {
      maxWidth: DEFAULT_CONTAINER_MAX_WIDTH,
      maxHeight: DEFAULT_CONTAINER_MAX_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.TIMESERIES) {
    return {
      width: DEFAULT_TIMESERIES_WIDTH,
      height: DEFAULT_TIMESERIES_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.ASSET) {
    return {
      width: DEFAULT_ASSET_WIDTH,
      height: DEFAULT_ASSET_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.EVENT) {
    return {
      width: DEFAULT_EVENT_WIDTH,
      height: DEFAULT_EVENT_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.THREE_D) {
    return {
      width: DEFAULT_THREE_D_WIDTH,
      height: DEFAULT_THREE_D_HEIGHT,
    };
  }

  if (containerReferenceType === ContainerReferenceType.FDM_INSTANCE) {
    return {
      width: DEFAULT_FDM_INSTANCE_WIDTH,
      height: DEFAULT_FDM_INSTANCE_HEIGHT,
    };
  }

  assertNever(
    containerReference,
    'Unsupported container reference type: ' + containerReferenceType
  );
};
