import { ResourceType } from '@cognite/data-exploration';

const isSupportedResourceType = (resourceType: ResourceType) =>
  ['asset', 'file', 'timeSeries', 'event', 'threeD'].includes(resourceType);

export default isSupportedResourceType;
