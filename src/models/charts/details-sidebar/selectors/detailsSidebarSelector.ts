import { Asset, DataSet, Timeseries } from '@cognite/sdk';
import DetailsSidebar from 'components/DetailsSidebar/DetailsSidebar';
import dayjs from 'dayjs';
import assetLink from 'models/cdf/assets/utils/assetLink';
import datasetLink from 'models/cdf/datasets/utils/datasetLink';
import {
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/charts/charts/types/types';
import { ComponentProps } from 'react';

type OutputType = ComponentProps<typeof DetailsSidebar>['source'];

export default function detailsSidebarselector(
  project: string,
  source: ChartWorkflow | ChartTimeSeries,
  statistics: {
    loading: boolean;
    error: unknown;
    values: OutputType['statistics'];
  },
  timeseries: {
    loading: boolean;
    error: { message?: string } | null;
    value: Timeseries | undefined;
  },
  asset: Asset | undefined,
  dataset: DataSet | undefined
): OutputType {
  return {
    name: source.name,
    color: source.color,
    type: source.type === 'workflow' ? 'calculation' : 'timeseries',
    statistics: statistics.values,
    metadata:
      source.type === 'workflow'
        ? {
            error: false,
            loading: false,
            type: 'calculation',
            name: source.name,
            lastUpdatedTime: dayjs(source.createdAt).format('LL LTS'),
            sourceId: source.id,
          }
        : {
            loading: timeseries.loading || statistics.loading,
            error: timeseries.error?.message ?? false,
            type: 'timeseries',
            name: source.name,
            description: timeseries.value?.description,
            externalId: timeseries.value?.externalId,
            lastUpdatedTime: dayjs(timeseries.value?.lastUpdatedTime).format(
              'LL LTS'
            ),
            isStep: timeseries.value?.isStep,
            sourceId: source.id,
            equipmentTag: asset?.name,
            equipmentLink: assetLink(project, timeseries.value?.assetId),
            datasetName: dataset?.name,
            datasetLink: datasetLink(project, timeseries.value?.dataSetId),
          },
  };
}
