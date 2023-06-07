import { ResourceTypes } from '../types';

export const getResourceTypeById = (id: string) => {
  if (id.includes(ResourceTypes.Event)) return ResourceTypes.Event;
  if (id.includes(ResourceTypes.File)) return ResourceTypes.File;
  if (id.includes(ResourceTypes.Sequence)) return ResourceTypes.Sequence;
  if (id.includes(ResourceTypes.TimeSeries)) return ResourceTypes.TimeSeries;
  return ResourceTypes.Asset;
};
