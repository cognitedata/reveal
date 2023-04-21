import { ResourceType } from '@cognite/data-exploration';

const isSupportedResourceType = (resourceType: ResourceType) =>
  ['asset', 'file', 'timeSeries', 'event'].includes(resourceType);

export default isSupportedResourceType;
