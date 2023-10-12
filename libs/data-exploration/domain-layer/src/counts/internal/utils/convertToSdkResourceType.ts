import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { ResourceType } from '@data-exploration-lib/core';

const RESOURCE_TYPES_MAP: Record<ResourceType, SdkResourceType> = {
  asset: 'assets',
  timeSeries: 'timeseries',
  sequence: 'sequences',
  file: 'files',
  event: 'events',
  threeD: 'threeD' as SdkResourceType,
  charts: 'charts' as SdkResourceType,
};

export const convertToSdkResourceType = (resourceType: ResourceType) => {
  return RESOURCE_TYPES_MAP[resourceType];
};
