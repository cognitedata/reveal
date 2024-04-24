/*!
 * Copyright 2024 Cognite AS
 */
import { type UseInfiniteQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteExternalId, type RelationshipResourceType } from '@cognite/sdk';

import { getRelationships } from '../hooks/network/getRelationships';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type RelationshipData, type RelationshipsFilterInternal } from '../utilities/types';
import { createLabelFilter } from '../utilities/createLabelFilters';
import { queryKeys } from '../utilities/queryKeys';

type Props = {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes: RelationshipResourceType[];
  filter?: RelationshipsFilterInternal;
  options?: UseInfiniteQueryOptions;
};

export function useRelationshipsQuery({
  resourceExternalIds,
  relationshipResourceTypes,
  filter
}: Props): UseQueryResult<RelationshipData[], unknown> {
  const sdk = useSDK();

  return useQuery(
    [
      queryKeys.timeseriesRelationshipsWithAssets(),
      resourceExternalIds,
      relationshipResourceTypes,
      filter
    ],
    async () => {
      return await getRelationships(sdk, {
        resourceExternalIds,
        relationshipResourceTypes,
        labels: createLabelFilter(filter?.labels)
      });
    }
  );
}
