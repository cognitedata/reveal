import { IdEither } from '@cognite/sdk';

import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedTimeseriesCount = (resourceId?: IdEither) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'timeseries',
  });

  return { data, isLoading };
};
