import { Asset } from '@cognite/sdk';
import LinkedAssetsSidebar from 'components/LinkedAssetsSidebar/LinkedAssetsSidebar';
import useAssetsTimeseries from 'models/cdf/assets/queries/useAssetsTimeseries';
import useTimeseriesAggregatedDatapoints from 'models/cdf/timeseries/queries/useTimeseriesAggregatedDatapoints';
import { ComponentProps } from 'react';

type ResponseType = ComponentProps<typeof LinkedAssetsSidebar>['assets'];

export default function linkedAssetsSelector(
  cdfAssets: Asset[],
  cdfAssetsTimeseries: ReturnType<typeof useAssetsTimeseries>,
  cdfDatapoints: ReturnType<typeof useTimeseriesAggregatedDatapoints>
): ResponseType {
  const organizedTimeseries = cdfAssetsTimeseries.map((ts) => ts.data?.list);

  const calculatedAsset = (asset: Asset, index: number) => ({
    asset: {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      totalTimeSeries: cdfAssetsTimeseries[index].data?.total ?? 0,
      hasDocuments: false,
    },
    loading: false,
    loadingTimeseries: cdfAssetsTimeseries[index].isFetching,
    timeseries:
      organizedTimeseries[index]?.map((ts) => {
        const datapoints = cdfDatapoints.find((dp) => dp.data?.id === ts.id);

        const finalDataPoints = datapoints
          ? {
              data: {
                datapoints:
                  datapoints.data?.datapoints.map(
                    ({ timestamp, average = NaN, min, max }) => ({
                      timestamp: new Date(timestamp),
                      min,
                      max,
                      average,
                    })
                  ) ?? [],
                startDate: datapoints.data?.startDate ?? new Date(),
                endDate: datapoints.data?.startDate ?? new Date(),
              },
              isFetched: datapoints.isFetched,
            }
          : {
              data: {
                datapoints: [],
                startDate: new Date(),
                endDate: new Date(),
              },
              isFetched: true,
            };

        return {
          id: ts.id,
          name: ts.name ?? '',
          description: ts.description,
          externalId: ts.externalId ?? '',
          checked: false,
          isStep: false,
          disabled: ts.isString,
          checkboxTooltip: ts.isString
            ? 'String timeseries are not supported yet'
            : undefined,
          sparkline: {
            startDate: finalDataPoints.data?.startDate,
            endDate: finalDataPoints.data?.endDate,
            datapoints: finalDataPoints.data?.datapoints,
            loading: !finalDataPoints.isFetched,
          },
        };
      }) ?? [],
  });
  return cdfAssets.map(calculatedAsset);
}
