import { createSelector } from 'reselect';
import { DataSet } from '@cognite/sdk';
import { RootState } from 'store';
import { DataSetCount } from 'modules/types';

export const dataSetSelector =
  (id: number) =>
  (state: RootState): DataSet | undefined =>
    state.datasets.items[id];

export const selectAllDataSets = createSelector(
  (state: RootState) => state.datasets.items,
  (items) => Object.values(items)
);

export const getIsFetchingDatasets = createSelector(
  (state: RootState) => state.datasets.status,
  (status) => status !== 'success'
);

export const datasetsFetched = createSelector(
  (state: RootState) => state.datasets.status,
  (status) => status === 'success'
);

export const dataSetCounts = createSelector(
  getIsFetchingDatasets,
  (state: RootState) => state.datasets.items,
  (state: RootState) => state.assets.count,
  (state: RootState) => state.files.count,
  (isFetching: boolean, datasets: any, assetCounts: any, fileCounts: any) => {
    if (isFetching) return undefined;
    const counts = Object.values(datasets).reduce((accl: any, dataset: any) => {
      const key = JSON.stringify({
        filter: { dataSetIds: [{ id: dataset.id }] },
      });
      const datasetCounts = {
        ...accl,
        [dataset.id]: {
          files: fileCounts[key]?.count ?? 0,
          assets: assetCounts[key]?.count ?? 0,
        },
      };
      return datasetCounts;
    }, {} as DataSetCount) as DataSetCount;
    return counts;
  }
);

export const dataSetCount = createSelector(
  dataSetCounts,
  (counts) => (id: number) => counts && counts[id]
);
