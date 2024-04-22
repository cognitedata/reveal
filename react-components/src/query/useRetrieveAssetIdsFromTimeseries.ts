/*!
 * Copyright 2024 Cognite AS
 */

import { isDefined } from '../utilities/isDefined';
import { type AssetAndTimeseriesIds } from '../utilities/types';
import { useAssetsByIdsQuery } from './useAssetsByIdsQuery';
import { useRelationshipsQuery } from './useRelationshipQuery';
import { useTimeseriesByIdsQuery } from './useTimeseriesByIdsQuery';
import { type InternalId, type ExternalId, type IdEither } from '@cognite/sdk';

export const useRetrieveAssetIdsFromTimeseries = (
  externalIds: string[]
): AssetAndTimeseriesIds[] => {
  // const timeseriesExternalId = 'LOR_KARLSTAD_WELL_05_Well_TOTAL_GAS_PRODUCTION';
  const timeseriesExternalIds = externalIds;

  const dataRelationship = useRelationshipsQuery({
    resourceExternalIds: timeseriesExternalIds.length > 0 ? timeseriesExternalIds : [],
    relationshipResourceTypes: ['asset']
  });

  const assetAndTimeseriesIdsFromRelationship =
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

        const assetAndTimeseriesIds = {
          assetIds,
          timeseriesIds
        };

        return assetAndTimeseriesIds;
      })
      ?.filter(isDefined) ?? [];

  // eslint-disable-next-line no-console
  console.log(
    ' TIMESERIES RELATIONSHIP TEST ',
    assetAndTimeseriesIdsFromRelationship,
    dataRelationship.data
  );

  const resourceExternalIds: ExternalId[] = timeseriesExternalIds.map((externalId) => {
    return {
      externalId
    };
  });

  // CONNECT TIMESERIES WITH ASSETS
  const { data: timeseriesData } = useTimeseriesByIdsQuery(resourceExternalIds);

  /*  const assetInternalIdFromTimeseries =
    timeseriesData?.map((item) => item.assetId)?.filter(isDefined) ?? []; */

  const assetIdsFound: IdEither[] =
    timeseriesData
      ?.map((timeseries) => {
        const assetIdFromTimeseries: InternalId | undefined =
          timeseries.assetId !== undefined
            ? {
                id: timeseries.assetId
              }
            : undefined;

        const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship.filter(
          (item) =>
            item.timeseriesIds.externalId === timeseries.externalId &&
            item.assetIds.id !== assetIdFromTimeseries?.id
        );

        const assetIdsFromRelationship = itemsFromRelationship.map((item) => {
          const itemFound: InternalId | undefined =
            item.assetIds.id !== undefined ? { id: item.assetIds.id } : undefined;
          return itemFound;
        });
        return assetIdsFromRelationship.concat(assetIdFromTimeseries).filter(isDefined);
      })
      .flat()
      .filter(isDefined) ?? [];

  const { data: assetFromTimeseries } = useAssetsByIdsQuery(assetIdsFound);

  const linkedAssetsFromTimeseries =
    timeseriesData
      ?.map((timeseries): AssetAndTimeseriesIds[] | undefined => {
        const linkedAsset = assetFromTimeseries?.find((asset) => asset.id === timeseries.assetId);
        const assetIds: Partial<ExternalId & InternalId> | undefined =
          linkedAsset !== undefined
            ? { externalId: linkedAsset.externalId, id: linkedAsset.id }
            : undefined;

        const assetAndTimeseriesFromLinked: AssetAndTimeseriesIds | undefined =
          assetIds !== undefined
            ? {
                assetIds,
                timeseries
              }
            : undefined;

        const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship.filter(
          (item) =>
            item.timeseriesIds.externalId === timeseries.externalId &&
            item.assetIds.id !== linkedAsset?.id
        );

        const assetAndTimeseriesFromRelationship: AssetAndTimeseriesIds[] =
          itemsFromRelationship.map((item) => {
            const itemFound: AssetAndTimeseriesIds = {
              assetIds: item.assetIds,
              timeseries
            };
            return itemFound;
          }) ?? [];

        if (assetAndTimeseriesFromLinked !== undefined) {
          assetAndTimeseriesFromRelationship.concat(assetAndTimeseriesFromLinked);
        }

        return assetAndTimeseriesFromRelationship;
      })
      .flat()
      .filter(isDefined) ?? [];

  // eslint-disable-next-line no-console
  console.log(' TIMESERIES ALL ', linkedAssetsFromTimeseries);
  return linkedAssetsFromTimeseries;
};
