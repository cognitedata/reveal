import { createSelector } from 'reselect';
import { DataSet } from '@cognite/sdk';
import { RootState } from 'store';
import { DataSetCount } from 'modules/types';

export const dataSetCounts = createSelector(
  (state: RootState) => state.datasets.items,
  (state: RootState) => state.assets.count,
  (state: RootState) => state.files.count,
  (datasets: any, assetCounts: any, fileCounts: any) => {
    return Object.values(datasets).reduce((accl: any, dataset: any) => {
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
  }
);
export const dataSetCount = createSelector(dataSetCounts, (counts) => {
  return (id: number) => counts[id];
});

export const dataSetSelector =
  (id: number) =>
  (state: RootState): DataSet | undefined =>
    state.datasets.items[id];

export const selectAllDataSets = (state: RootState): DataSet[] =>
  Object.values(state.datasets.items);

export const getIsFetchingDatasets = (state: RootState): Boolean =>
  state.datasets.status !== 'success';

export const datasetsFetched = (state: RootState): Boolean =>
  state.datasets.status === 'success';
