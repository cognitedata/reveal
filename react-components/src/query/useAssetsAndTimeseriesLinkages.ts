/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import {
  type IdEither,
  type InternalId,
  type Timeseries,
  type RelationshipResourceType,
  type CogniteClient,
  type Asset
} from '@cognite/sdk';

import { getRelationships } from '../hooks/network/getRelationships';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type AssetAndTimeseriesIds, type AssetAndTimeseries } from '../data-providers/types';
import { queryKeys } from '../utilities/queryKeys';
import { isDefined } from '../utilities/isDefined';
import { getAssetsByIds } from '../hooks/network/getAssetsByIds';
import { chunk, uniq, uniqBy } from 'lodash';
import { executeParallel } from '../utilities/executeParallel';
import { useMemo } from 'react';

const FETCH_RELATIONSHIP_CHUNK = 1000;

export function useAssetsAndTimeseriesLinkages(
  timeseriesData: Timeseries[]
): UseQueryResult<AssetAndTimeseries[], unknown> {
  const sdk = useSDK();

  const timeseriesExternalIds = useMemo(() => {
    return uniq(timeseriesData?.map((item) => item.externalId).filter(isDefined));
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
      const assetAndTimeseriesIdsFromRelationship = await fetchLinkFromRelationships(
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

const getLinkedTimeseriesForAsset = (
  asset: Asset,
  timeseries: Timeseries[],
  relationshipIds: AssetAndTimeseriesIds[]
): Timeseries[] => {
  const timeseriesLinkedToAsset = timeseries.filter((item) => {
    const relationshipFoundForThisAsset = relationshipIds.find((relationship) => {
      return (
        relationship.assetIds.externalId === asset.externalId &&
        relationship.timeseriesIds.externalId === item.externalId
      );
    });
    if (relationshipFoundForThisAsset !== undefined) return true;
    return item.assetId === asset.id;
  });

  return timeseriesLinkedToAsset;
};

const fetchLinkFromRelationships = async (
  sdk: CogniteClient,
  timeseriesExternalIds: string[],
  relationshipResourceTypes: RelationshipResourceType[]
): Promise<AssetAndTimeseriesIds[]> => {
  const timeseriesChunks = chunk(timeseriesExternalIds, FETCH_RELATIONSHIP_CHUNK);

  const dataRelationship = await executeParallel(
    timeseriesChunks.map(
      (timeseriesIds) => async () =>
        await getRelationships(sdk, {
          resourceExternalIds: timeseriesIds,
          relationshipResourceTypes
        })
    ),
    2
  );

  const cleanDataRelationship = dataRelationship.filter(isDefined).flat();

  const assetAndTimeseriesIdsFromRelationship =
    cleanDataRelationship?.map((item) => {
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

      return assetAndTimeseriesIds;
    }) ?? [];

  return assetAndTimeseriesIdsFromRelationship;
};
