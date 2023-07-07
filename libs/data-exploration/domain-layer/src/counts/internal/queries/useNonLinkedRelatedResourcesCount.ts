import { ResourceType } from '@data-exploration-lib/core';

import { BaseResourceProps } from '../types';

import { useLinkedResourcesCount } from './useLinkedResourcesCount';
import { useNonLinkedRelatedResourcesIds } from './useNonLinkedRelatedResourcesIds';

export const useNonLinkedRelatedResourcesCount = ({
  resource,
  resourceType,
  isDocumentsApiEnabled = true,
}: {
  resource?: BaseResourceProps;
  resourceType: ResourceType;
  isDocumentsApiEnabled?: boolean;
}) => {
  const nonLinkedRelatedResourcesIds = useNonLinkedRelatedResourcesIds({
    resource,
    resourceType,
    isDocumentsApiEnabled,
  });

  const { data, isLoading } = useLinkedResourcesCount({
    resource,
    resourceType,
    linkedResourceIds: nonLinkedRelatedResourcesIds.data,
    isDocumentsApiEnabled,
  });

  const count = nonLinkedRelatedResourcesIds.data.length ? data : 0;

  return { data: count, isLoading };
};
