import { TimeseriesFilter } from '@cognite/sdk';

// TODO: Remove the 'file filter props' and convert to internal types
export type InternalTimeseriesFilters = Omit<
  TimeseriesFilter,
  'assetSubtreeIds' | 'dataSetIds'
> & {
  assetSubtreeIds?: { label?: string; value: number }[];
  dataSetIds?: { label?: string; value: number }[];
};
