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

  // eslint-disable-next-line no-console
  console.log(' TIMESERIES RELATIONSHIP TEST ', assetAndTimeseriesIdsFromRelationship);

  // CONNECT TIMESERIES WITH ASSETS
  const { data: timeseriesData } = useTimeseriesByIdsQuery(resourceExternalIds);

  // eslint-disable-next-line no-console
  console.log(' timeseriesData ', timeseriesData);
  const assetIdsFound: IdEither[] =
    timeseriesData
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

  // eslint-disable-next-line no-console
  console.log(' assetIdsFound ', assetIdsFound);
  // eslint-disable-next-line no-console
  console.log(' assetFromTimeseries ', assetFromTimeseries);

  const linkedAssetsFromTimeseries =
    timeseriesData
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
  const assetFound = contextualizedAssetNodes.find((asset) => asset.id === timeseries.assetId);

  if (assetFound?.externalId === undefined) return undefined;

  const assetIdFromTimeseries: ExternalId | undefined =
    timeseries.assetId !== undefined
      ? {
          externalId: assetFound.externalId
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
  return assetIdsFromRelationship?.concat(assetIdFromTimeseries).filter(isDefined);
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
      item.assetIds.id !== linkedAsset?.id
  );

  const assetAndTimeseriesFromRelationship: AssetIdsAndTimeseries[] =
    itemsFromRelationship?.map((item) => {
      const itemFound: AssetIdsAndTimeseries = {
        assetIds: item.assetIds,
        timeseries
      };
      return itemFound;
    }) ?? [];

  if (assetAndTimeseriesFromLinked !== undefined) {
    assetAndTimeseriesFromRelationship.push(assetAndTimeseriesFromLinked);
  }

  return assetAndTimeseriesFromRelationship;
};
