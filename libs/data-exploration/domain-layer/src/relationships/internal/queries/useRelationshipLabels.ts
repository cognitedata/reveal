import { useMemo } from 'react';

import { RelationshipResourceType } from '@cognite/sdk';

import { ALL_RELATIONSHIP_RESOURCE_TYPES } from '../../constants';
import { useRelationshipsQuery } from '../../service';
import { extractRelationshipLabels } from '../transformers';
import { RelationshipsFilterInternal } from '../types';

interface Props {
  resourceExternalId?: string;
  relationshipResourceTypes?: RelationshipResourceType[];
  filter?: RelationshipsFilterInternal;
}

export const useRelationshipLabels = ({
  resourceExternalId,
  relationshipResourceTypes = ALL_RELATIONSHIP_RESOURCE_TYPES,
  filter,
}: Props) => {
  const { data = [], isLoading } = useRelationshipsQuery({
    resourceExternalIds: resourceExternalId ? [resourceExternalId] : [],
    relationshipResourceTypes,
    filter,
  });

  const relationshipLabels = useMemo(() => {
    return extractRelationshipLabels(data);
  }, [data]);

  return {
    data: relationshipLabels,
    isLoading,
  };
};
