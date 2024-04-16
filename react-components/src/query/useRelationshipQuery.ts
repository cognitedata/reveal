/*!
 * Copyright 2024 Cognite AS
 */
import { type UseInfiniteQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteExternalId, type RelationshipResourceType } from '@cognite/sdk';

import { getRelationships } from '../hooks/network/getRelationships';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type ExtendedRelationship, type RelationshipsFilterInternal } from '../utilities/types';
import { createLabelFilter } from '../utilities/createLabelFilters';

type Props = {
  resourceExternalIds: CogniteExternalId[];
  relationshipResourceTypes: RelationshipResourceType[];
  filter?: RelationshipsFilterInternal;
  options?: UseInfiniteQueryOptions;
};

export const useRelationshipsQuery = ({
  resourceExternalIds,
  relationshipResourceTypes,
  filter
}: Props): UseQueryResult<ExtendedRelationship[], unknown> => {
  const sdk = useSDK();

  // TODO move this to an argument to keep it generic.
  const queryKeys = ['reveal', 'react-components', 'timeseries-relationships-assets'];
  return useQuery(queryKeys, async () => {
    return await getRelationships(sdk, {
      resourceExternalIds,
      relationshipResourceTypes,
      labels: createLabelFilter(filter?.labels)
    });
  });
};
