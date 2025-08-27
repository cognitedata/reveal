import { type Asset, type Timeseries } from '@cognite/sdk';
import { type AssetAndTimeseriesIds } from '../../data-providers/types';

export const getLinkedTimeseriesForAsset = (
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
