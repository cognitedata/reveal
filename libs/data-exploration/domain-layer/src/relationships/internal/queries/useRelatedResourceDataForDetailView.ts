import { useMemo } from 'react';

import { RelationshipResourceType } from '@cognite/sdk';

import { useRelationshipsQuery } from '../../service';
import { transformToDetailViewData } from '../transformers';
import { RelationshipsFilterInternal } from '../types';

interface Props {
  resourceExternalId?: string;
  relationshipResourceType: RelationshipResourceType;
  filter?: RelationshipsFilterInternal;
}

export const useRelatedResourceDataForDetailView = ({
  resourceExternalId,
  relationshipResourceType,
  filter,
}: Props) => {
  const { data = [], isLoading } = useRelationshipsQuery({
    resourceExternalIds: resourceExternalId ? [resourceExternalId] : [],
    relationshipResourceTypes: [relationshipResourceType],
    filter,
  });

  const transformedData = useMemo(() => {
    return transformToDetailViewData(data);
  }, [data]);

  return {
    data: transformedData,
    isLoading,
  };
};
