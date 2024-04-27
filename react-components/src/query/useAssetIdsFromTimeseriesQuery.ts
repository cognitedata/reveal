/*!
 * Copyright 2024 Cognite AS
 */

import { isDefined } from '../utilities/isDefined';
import { type AssetAndTimeseriesIds, type AssetIdsAndTimeseries } from '../utilities/types';
import { useAssetsByIdsQuery } from './useAssetsByIdsQuery';
import { useRelationshipsQuery } from './useRelationshipQuery';
import { useTimeseriesByIdsQuery } from './useTimeseriesByIdsQuery';
import {
  type InternalId,
  type ExternalId,
  type IdEither,
  type Asset,
  type Timeseries
} from '@cognite/sdk';

export function useAssetIdsFromTimeseriesQuery(
  externalIds: string[],
  contextualizedAssetNodes: Asset[]
): AssetIdsAndTimeseries[] {
  const timeseriesExternalIds = externalIds;
  const resourceExternalIds: ExternalId[] = timeseriesExternalIds.map((externalId) => {
    return {
      externalId
    };
  });

  const { data: assetAndTimeseriesIdsFromRelationship } = useRelationshipsQuery({
    resourceExternalIds: timeseriesExternalIds.length > 0 ? timeseriesExternalIds : [],
    relationshipResourceTypes: ['asset']
  });

  // CONNECT TIMESERIES WITH ASSETS
  const { data: allTimeseriesData } = useTimeseriesByIdsQuery(resourceExternalIds);

  const assetIdsFound: IdEither[] =
    allTimeseriesData
      ?.map((timeseries) => {
        return getAssetIdsFromTimeseries(
          contextualizedAssetNodes,
          timeseries,
          assetAndTimeseriesIdsFromRelationship
        );
      })
      .flat()
      .filter(isDefined) ?? [];

  const { data: assetFromTimeseries } = useAssetsByIdsQuery(assetIdsFound);

  const linkedAssetsFromTimeseries =
    allTimeseriesData
      ?.map((timeseries): AssetIdsAndTimeseries[] | undefined => {
        return generateAssetAndTimeseries(
          assetFromTimeseries,
          timeseries,
          assetAndTimeseriesIdsFromRelationship
        );
      })
      .flat()
      .filter(isDefined) ?? [];

  // eslint-disable-next-line no-console
  console.log(' TIMESERIES ALL ', linkedAssetsFromTimeseries);
  return linkedAssetsFromTimeseries;
}

const getAssetIdsFromTimeseries = (
  contextualizedAssetNodes: Asset[],
  timeseries: Timeseries,
  assetAndTimeseriesIdsFromRelationship: AssetAndTimeseriesIds[] | undefined
): Array<ExternalId | undefined> | undefined => {
  const assetFoundFromTimeseries = contextualizedAssetNodes.find(
    (asset) => asset.id === timeseries.assetId
  );

  const assetIdFromTimeseries: ExternalId | undefined =
    assetFoundFromTimeseries?.externalId !== undefined
      ? {
          externalId: assetFoundFromTimeseries.externalId
        }
      : undefined;

  const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship?.filter(
    (item) =>
      item.timeseriesIds.externalId === timeseries.externalId &&
      item.assetIds.externalId !== assetIdFromTimeseries?.externalId
  );

  const assetIdsFromRelationship = itemsFromRelationship?.map((item) => {
    const itemFound: ExternalId | undefined =
      item.assetIds.externalId !== undefined ? { externalId: item.assetIds.externalId } : undefined;
    return itemFound;
  });

  const assetIdsFromTimeseriesAndRelationship = assetIdsFromRelationship
    ?.concat(assetIdFromTimeseries)
    .filter(isDefined);

  return assetIdsFromTimeseriesAndRelationship;
};

const generateAssetAndTimeseries = (
  assetFromTimeseries: Asset[] | undefined,
  timeseries: Timeseries,
  assetAndTimeseriesIdsFromRelationship: AssetAndTimeseriesIds[] | undefined
): AssetIdsAndTimeseries[] => {
  const linkedAsset = assetFromTimeseries?.find((asset) => asset.id === timeseries.assetId);
  const assetIds: Partial<ExternalId & InternalId> | undefined =
    linkedAsset !== undefined
      ? { externalId: linkedAsset.externalId, id: linkedAsset.id }
      : undefined;

  const assetAndTimeseriesFromLinked: AssetIdsAndTimeseries | undefined =
    assetIds !== undefined
      ? {
          assetIds,
          timeseries
        }
      : undefined;

  const itemsFromRelationship = assetAndTimeseriesIdsFromRelationship?.filter(
    (item) =>
      item.timeseriesIds.externalId === timeseries.externalId &&
      item.assetIds.externalId !== linkedAsset?.externalId
  );

  const assetAndTimeseriesFromAll: AssetIdsAndTimeseries[] =
    itemsFromRelationship?.map((item) => {
      const itemFound: AssetIdsAndTimeseries = {
        assetIds: item.assetIds,
        timeseries
      };
      return itemFound;
    }) ?? [];

  if (assetAndTimeseriesFromLinked !== undefined) {
    assetAndTimeseriesFromAll.push(assetAndTimeseriesFromLinked);
  }

  return assetAndTimeseriesFromAll;
};
