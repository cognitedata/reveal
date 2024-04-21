/*!
 * Copyright 2024 Cognite AS
 */

import { isDefined } from '../utilities/isDefined';
import { type AssetAndTimeseriesIds } from '../utilities/types';
import { useAssetsByIdsQuery } from './useAssetsByIdsQuery';
import { useRelationshipsQuery } from './useRelationshipQuery';
import { useTimeseriesByIdsQuery } from './useTimeseriesByIdsQuery';
import { type InternalId, type ExternalId } from '@cognite/sdk';

export const useRetrieveAssetIdsFromTimeseries = (
  externalIds: string[]
): AssetAndTimeseriesIds[] => {
  // const timeseriesExternalId = 'LOR_KARLSTAD_WELL_05_Well_TOTAL_GAS_PRODUCTION';
  const timeseriesExternalIds = externalIds;

  const dataRelationship = useRelationshipsQuery({
    resourceExternalIds: timeseriesExternalIds.length > 0 ? timeseriesExternalIds : [],
    relationshipResourceTypes: ['asset']
  });

  const assetAndTimeseriesIds =
    dataRelationship?.data
      ?.map((item) => {
        const assetIds: Partial<ExternalId & InternalId> = {};
        const timeseriesIds: Partial<ExternalId & InternalId> = {};

        if (item.sourceType === 'asset') {
          assetIds.id = item.source.id;
          assetIds.externalId = item.source.externalId;
        } else if (item.targetType === 'asset') {
          assetIds.id = item.target.id;
          assetIds.externalId = item.target.externalId;
        }

        if (item.sourceType === 'timeSeries') {
          timeseriesIds.id = item.source.id;
          timeseriesIds.externalId = item.source.externalId;
        } else if (item.targetType === 'timeSeries') {
          timeseriesIds.id = item.target.id;
          timeseriesIds.externalId = item.target.externalId;
        }

        const assetAndTimeseriesIds: AssetAndTimeseriesIds = {
          assetIds,
          timeseriesIds
        };

        return assetAndTimeseriesIds;
      })
      ?.filter(isDefined) ?? [];

  // eslint-disable-next-line no-console
  console.log(' TIMESERIES RELATIONSHIP TEST ', assetAndTimeseriesIds, dataRelationship.data);

  const resourceExternalIds: ExternalId[] = timeseriesExternalIds.map((externalId) => {
    return {
      externalId
    };
  });

  // CONNECT TIMESERIES WITH ASSETS
  const { data: timeseriesData } = useTimeseriesByIdsQuery(resourceExternalIds);

  const assetInternalIdFromTimeseries =
    timeseriesData?.map((item) => item.assetId)?.filter(isDefined) ?? [];

  const { data: assetFromTimeseries } = useAssetsByIdsQuery(
    assetInternalIdFromTimeseries.map((id) => {
      return {
        id
      };
    })
  );

  const linkedAssetsFromTimeseries =
    timeseriesData
      ?.map((timeseries): AssetAndTimeseriesIds | undefined => {
        const assetIds: Partial<ExternalId & InternalId> = {};
        const timeseriesIds: Partial<ExternalId & InternalId> = {};
        const linkedAsset = assetFromTimeseries?.find((asset) => asset.id === timeseries.assetId);

        if (linkedAsset === undefined) return undefined;

        assetIds.externalId = linkedAsset.externalId;
        assetIds.id = linkedAsset.id;

        timeseriesIds.externalId = timeseries.externalId;
        timeseriesIds.id = timeseries.id;

        const assetAndTimeseriesIds: AssetAndTimeseriesIds = {
          assetIds,
          timeseriesIds
        };
        return assetAndTimeseriesIds;
      })
      .filter(isDefined) ?? [];

  const combinedAssetsLinkedToTimeseries = assetAndTimeseriesIds.concat(linkedAssetsFromTimeseries);
  // eslint-disable-next-line no-console
  console.log(' TIMESERIES ALL ', combinedAssetsLinkedToTimeseries);
  return combinedAssetsLinkedToTimeseries;
};
