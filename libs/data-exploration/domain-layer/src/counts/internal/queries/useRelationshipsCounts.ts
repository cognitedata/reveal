import { useMemo } from 'react';

import { IdEither } from '@cognite/sdk';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { Counts } from '../types';
import { extractExternalId } from '../utils';

export const useRelationshipsCounts = (resourceId?: IdEither) => {
  const { data, isLoading } = useRelatedResourceExternalIds(
    extractExternalId(resourceId)
  );

  const counts: Counts = useMemo(() => {
    return Object.entries(data).reduce((result, [type, externalIds]) => {
      return {
        ...result,
        [type]: externalIds.length,
      };
    }, {} as Counts);
  }, [data]);

  return { data: counts, isLoading };
};
