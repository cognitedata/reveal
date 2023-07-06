import { useMemo } from 'react';

import { IdEither } from '@cognite/sdk';

import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedAssetsCount = (resourceId?: IdEither) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'assets',
  });

  const count = useMemo(() => {
    if (data) {
      // Exclude root asset
      return data - 1;
    }
    return 0;
  }, [data]);

  return { data: count, isLoading };
};
