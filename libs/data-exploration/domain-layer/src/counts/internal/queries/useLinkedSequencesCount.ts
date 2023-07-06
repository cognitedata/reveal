import { IdEither } from '@cognite/sdk';

import { useLinkedResourcesCountQuery } from '../../service';

export const useLinkedSequencesCount = (resourceId?: IdEither) => {
  const { data = 0, isLoading } = useLinkedResourcesCountQuery({
    resourceId,
    resourceType: 'sequences',
  });

  return { data, isLoading };
};
