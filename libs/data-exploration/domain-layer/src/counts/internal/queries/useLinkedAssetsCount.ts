import { useMemo } from 'react';

import { IdEither } from '@cognite/sdk';

import { ResourceType, ResourceTypes } from '@data-exploration-lib/core';

import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedAssetsCount = (
  resourceId: IdEither | undefined,
  resourceType: ResourceType
) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'assets',
  });

  const count = useMemo(() => {
    // Exclude root asset if resource type is also asset
    if (data && resourceType === ResourceTypes.Asset) {
      return data - 1;
    }
    return 0;
  }, [data, resourceType]);

  return { data: count, isLoading };
};
