import { UseInfiniteQueryOptions, useQuery } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';

import { CogniteExternalId, RelationshipResourceType } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { RelationshipsFilterInternal } from '../../internal/types';
import { getRelationships } from '../network';
import { createLabelFilter } from '../utils';

interface Props {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes: RelationshipResourceType[];
  filter?: RelationshipsFilterInternal;
  options?: UseInfiniteQueryOptions;
}

export const useRelationshipsQuery = ({
  resourceExternalIds,
  relationshipResourceTypes,
  filter,
  options = { enabled: true },
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.resourceRelationships(
      resourceExternalIds,
      relationshipResourceTypes,
      filter
    ),
    () => {
      return getRelationships(sdk, {
        resourceExternalIds,
        relationshipResourceTypes,
        labels: createLabelFilter(filter?.labels),
      });
    },
    {
      ...(options as any),
      enabled:
        !isEmpty(resourceExternalIds) &&
        !isEmpty(relationshipResourceTypes) &&
        options?.enabled,
      keepPreviousData: true,
    }
  );
};
