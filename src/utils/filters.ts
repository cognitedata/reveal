import {
  ANNOTATION_METADATA_PREFIX as PREFIX,
  getIdFilter,
  getExternalIdFilter,
} from '@cognite/annotations';
import { ResourceType } from 'types';

export const annotationInteralIdFilter = (
  fileId: number,
  resourceType?: ResourceType
) => {
  const filter = getIdFilter(fileId);
  if (resourceType) {
    filter.metadata[`${PREFIX}resource_type`] = resourceType;
  }
  return filter;
};

export const annotationExternalIdFilter = (
  id: string,
  resourceType?: ResourceType
) => {
  const filter = getExternalIdFilter(id);
  if (resourceType) {
    filter.metadata[`${PREFIX}resource_type`] = resourceType;
  }
  return filter;
};
