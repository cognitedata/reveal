import { useMemo } from 'react';

import { RelationshipResourceType } from '@cognite/sdk';

import { ALL_RELATIONSHIP_RESOURCE_TYPES } from '../../constants';
import { useRelationshipsQuery } from '../../service';
import { transformToRelatedResourceExternalIds } from '../transformers';
import { RelationshipsFilterInternal } from '../types';

interface Props {
  resourceExternalId?: string;
  relationshipResourceTypes?: RelationshipResourceType[];
  filter?: RelationshipsFilterInternal;
}

export const useRelatedResourceExternalIds = ({
  resourceExternalId,
  relationshipResourceTypes = ALL_RELATIONSHIP_RESOURCE_TYPES,
  filter,
}: Props) => {
  const { data = [], isInitialLoading } = useRelationshipsQuery({
    resourceExternalIds: resourceExternalId ? [resourceExternalId] : [],
    relationshipResourceTypes,
    filter,
  });

  const transformedData = useMemo(() => {
    return transformToRelatedResourceExternalIds(data);
  }, [data]);

  return {
    data: transformedData,
    isLoading: isInitialLoading,
  };
};
