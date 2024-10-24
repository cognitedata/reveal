/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import {
  type IdEither,
  type InternalId,
  type Timeseries,
  type RelationshipResourceType
} from '@cognite/sdk';

import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type AssetAndTimeseries } from '../data-providers/types';
import { queryKeys } from '../utilities/queryKeys';
import { isDefined } from '../utilities/isDefined';
import { getAssetsByIds } from '../hooks/network/getAssetsByIds';
import { uniq, uniqBy } from 'lodash';
import { useMemo } from 'react';
import { getLinkedTimeseriesForAsset } from '../hooks/network/getLinkedTimeseriesForAsset';
import { fetchLinkFromRelationshipsByTimeseries } from '../hooks/network/fetchLinkFromRelationshipsByTimeseries';

export function useAssetsAndTimeseriesLinkages(
  timeseriesData: Timeseries[]
): UseQueryResult<AssetAndTimeseries[], unknown> {
  const sdk = useSDK();

  const timeseriesExternalIds = useMemo(() => {
    return uniq(timeseriesData.map((item) => item.externalId).filter(isDefined));
  }, [timeseriesData]);

  const assetIds = useMemo(() => {
    return uniq(
      timeseriesData
        ?.map((item) => {
          if (item.assetId === undefined) {
            return undefined;
          }
          const assetId: InternalId = { id: item.assetId };
          return assetId;
        })
        .filter(isDefined)
    );
  }, [timeseriesData]);

  const relationshipResourceTypes: RelationshipResourceType[] = ['asset'];

  return useQuery({
    queryKey: [
      queryKeys.timeseriesLinkedToAssets(),
      relationshipResourceTypes,
      timeseriesExternalIds,
      assetIds.map((item) => item.id)
    ],
    queryFn: async () => {
      const assetAndTimeseriesIdsFromRelationship = await fetchLinkFromRelationshipsByTimeseries(
        sdk,
        timeseriesExternalIds,
        relationshipResourceTypes
      );

      // extract the asset ids from the assetAndTimeseriesIdsFromRelationship
      const assetIdsFromRelationship = assetAndTimeseriesIdsFromRelationship.map(
        (item) => item.assetIds
      );

      const uniqueAssetInternalIdsFromTimeseries = uniqBy(assetIds, 'id');
      const uniqueAssetPartialExternalIdsFromTimeseries = uniqBy(
        assetIdsFromRelationship,
        'externalId'
      );

      const uniqueAssetExternalIdsFromTimeseries = uniqueAssetPartialExternalIdsFromTimeseries
        .map((item) => {
          if (item.externalId === undefined) return undefined;
          const id: IdEither = { externalId: item.externalId };
          return id;
        })
        .filter(isDefined);

      const assetsInternalId = await getAssetsByIds(sdk, uniqueAssetInternalIdsFromTimeseries);
      const assetsExternalId = await getAssetsByIds(sdk, uniqueAssetExternalIdsFromTimeseries);

      const allAssetsFound = assetsInternalId.concat(assetsExternalId);

      const uniqueAssetsFound = uniqBy(allAssetsFound, 'id');

      const assetsAndTimeseriesAll: AssetAndTimeseries[] = uniqueAssetsFound.map((asset) => {
        return {
          asset,
          timeseries: getLinkedTimeseriesForAsset(
            asset,
            timeseriesData,
            assetAndTimeseriesIdsFromRelationship
          )
        };
      });

      return assetsAndTimeseriesAll;
    },
    enabled: timeseriesExternalIds.length > 0
  });
}
