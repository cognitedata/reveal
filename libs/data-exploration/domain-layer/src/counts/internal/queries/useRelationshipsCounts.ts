import { useMemo } from 'react';

import { useRelatedResourceExternalIds } from '../../../relationships';
import { BaseResourceProps, Counts } from '../types';
import { extractExternalId, getResourceId } from '../utils';

export const useRelationshipsCounts = (resource?: BaseResourceProps) => {
  const resourceId = getResourceId(resource);
  const resourceExternalId = extractExternalId(resourceId);

  const { data, isLoading } = useRelatedResourceExternalIds(resourceExternalId);

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
