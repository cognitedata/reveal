import { IdEither } from '@cognite/sdk';

import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedEventsCount = (resourceId?: IdEither) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'events',
  });

  return { data, isLoading };
};
