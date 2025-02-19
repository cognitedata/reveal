/*!
 * Copyright 2025 Cognite AS
 */
import { type Asset, type Datapoints } from '@cognite/sdk/';
import { type AssetIdsAndTimeseries } from '../../../data-providers/types';
import { type TimeseriesAndDatapoints } from '../types';
import { isDefined } from '../../../utilities/isDefined';

export const generateTimeseriesAndDatapointsFromTheAsset = ({
  contextualizedAssetNode,
  assetIdsAndTimeseries,
  timeseriesDatapoints
}: {
  contextualizedAssetNode: Asset;
  assetIdsAndTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[] | undefined;
}): TimeseriesAndDatapoints[] => {
  const timeseriesLinkedToThisAsset = assetIdsAndTimeseries.filter(
    (item) => item.assetIds?.externalId === contextualizedAssetNode.externalId
  );

  const datapoints = timeseriesDatapoints?.filter((datapoint) =>
    timeseriesLinkedToThisAsset?.find(
      (item) => item?.timeseries?.externalId === datapoint.externalId
    )
  );

  const timeseriesData: TimeseriesAndDatapoints[] = timeseriesLinkedToThisAsset
    .map((item) => {
      if (item.timeseries === undefined) return undefined;
      const datapoint = datapoints?.find(
        (datapoint) => datapoint.externalId === item.timeseries?.externalId
      );
      if (datapoint === undefined) return undefined;

      const content: TimeseriesAndDatapoints = {
        ...item.timeseries,
        ...datapoint
      };
      return content;
    })
    .filter(isDefined);
  return timeseriesData;
};
