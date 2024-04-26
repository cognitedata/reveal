/*!
 * Copyright 2024 Cognite AS
 */
import { type UseInfiniteQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type CogniteExternalId, type RelationshipResourceType } from '@cognite/sdk';

import { getRelationships } from '../hooks/network/getRelationships';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type AssetAndTimeseriesIds, type RelationshipsFilterInternal } from '../utilities/types';
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
}: Props): UseQueryResult<AssetAndTimeseriesIds[], unknown> {
  const sdk = useSDK();

  return useQuery(
    [
      queryKeys.timeseriesRelationshipsWithAssets(),
      resourceExternalIds,
      relationshipResourceTypes,
      filter
    ],
    async () => {
      const dataRelationship = await getRelationships(sdk, {
        resourceExternalIds,
        relationshipResourceTypes,
        labels: createLabelFilter(filter?.labels)
      });

      const assetAndTimeseriesIdsFromRelationship =
        dataRelationship?.map((item) => {
          const assetAndTimeseriesIds: AssetAndTimeseriesIds = {
            assetIds: { externalId: '' },
            timeseriesIds: { externalId: '' }
          };

          if (item.sourceType === 'asset') {
            assetAndTimeseriesIds.assetIds.externalId = item.sourceExternalId;
          } else if (item.targetType === 'asset') {
            assetAndTimeseriesIds.assetIds.externalId = item.targetExternalId;
          }

          if (item.sourceType === 'timeSeries') {
            assetAndTimeseriesIds.timeseriesIds.externalId = item.sourceExternalId;
          } else if (item.targetType === 'timeSeries') {
            assetAndTimeseriesIds.timeseriesIds.externalId = item.targetExternalId;
          }

          // eslint-disable-next-line no-console
          console.log(' assetAndTimeseriesIds ', assetAndTimeseriesIds);
          return assetAndTimeseriesIds;
        }) ?? [];

      return assetAndTimeseriesIdsFromRelationship;
    },
    {
      enabled: resourceExternalIds.length > 0
    }
  );
}
