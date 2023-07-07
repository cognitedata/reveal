import { useMemo } from 'react';

import { RelationshipResourceType } from '@cognite/sdk';

import { ALL_RELATIONSHIP_RESOURCE_TYPES } from '../../constants';
import { useRelationshipsQuery } from '../../service';
import { transformToRelatedResourceExternalIds } from '../transformers';

export const useRelatedResourceExternalIds = (
  resourceExternalId?: string,
  relationshipResourceTypes: RelationshipResourceType[] = ALL_RELATIONSHIP_RESOURCE_TYPES
) => {
  const { data = [], isLoading } = useRelationshipsQuery(
    resourceExternalId ? [resourceExternalId] : [],
    relationshipResourceTypes
  );

  const transformedData = useMemo(() => {
    return transformToRelatedResourceExternalIds(data);
  }, [data]);

  return {
    data: transformedData,
    isLoading,
  };
};
