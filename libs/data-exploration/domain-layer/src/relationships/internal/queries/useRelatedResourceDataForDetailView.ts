import { useMemo } from 'react';

import { UseInfiniteQueryOptions } from '@tanstack/react-query';

import { RelationshipResourceType } from '@cognite/sdk';

import { useRelationshipsQuery } from '../../service';
import { transformToDetailViewData } from '../transformers';
import { RelationshipsFilterInternal } from '../types';

interface Props {
  resourceExternalId?: string;
  relationshipResourceType: RelationshipResourceType;
  filter?: RelationshipsFilterInternal;
  options?: UseInfiniteQueryOptions;
}

export const useRelatedResourceDataForDetailView = ({
  resourceExternalId,
  relationshipResourceType,
  filter,
  options = {},
}: Props) => {
  const { data = [], isLoading } = useRelationshipsQuery({
    resourceExternalIds: resourceExternalId ? [resourceExternalId] : [],
    relationshipResourceTypes: [relationshipResourceType],
    filter,
    options,
  });

  const transformedData = useMemo(() => {
    return transformToDetailViewData(data);
  }, [data]);

  return {
    data: transformedData,
    isLoading,
  };
};
