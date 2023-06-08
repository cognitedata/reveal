import { followCursors } from '@interactive-diagrams-app/helpers';
import { count as countAssets } from '@interactive-diagrams-app/modules/assets';
import { count as countFiles } from '@interactive-diagrams-app/modules/files';
import { createAsyncThunk } from '@reduxjs/toolkit';
import zipObject from 'lodash/zipObject';

import sdk from '@cognite/cdf-sdk-singleton';
import { DataSet, DataSetFilterRequest } from '@cognite/sdk';

export const listDatasets = createAsyncThunk(
  'datasets/list',
  async (
    { noTypeCheck = false }: { noTypeCheck?: boolean },
    { dispatch }: { dispatch: any }
  ) => {
    const { items } = await followCursors<DataSetFilterRequest, DataSet>(
      {},
      sdk.datasets.list
    );

    // Only keep un-archived datasets
    const newItems = items.filter(
      (dataset: DataSet) =>
        dataset?.metadata?.archived === 'false' || !dataset?.metadata?.archived
    );
    if (!noTypeCheck) {
      await Promise.all(
        newItems.map((dataset: DataSet) =>
          dispatch(getResourceCount(dataset.id))
        )
      );
    }
    return { result: newItems };
  }
);

export function mergeDatasets(
  datasets: { [key: number]: DataSet },
  newDatasets: DataSet[]
): { [key: number]: DataSet } {
  const ids = newDatasets.map((a) => a.id);
  return {
    ...datasets,
    ...zipObject(ids, newDatasets),
  };
}

export function getResourceCount(id: number) {
  return async (dispatch: any) => {
    const filter = { filter: { dataSetIds: [{ id }] } };
    await Promise.allSettled([
      dispatch(countAssets({ filter })),
      dispatch(countFiles({ filter })),
    ]);
  };
}
