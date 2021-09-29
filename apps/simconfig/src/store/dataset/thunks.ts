import { CogniteClient } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchDatasets = createAsyncThunk(
  'dataset/fetchDatasets',
  async (client: CogniteClient) =>
    (await client.datasets.list()).items.map((dataset) => ({
      ...dataset,
      createdTime: dataset.createdTime?.getTime(),
      lastUpdatedTime: dataset.lastUpdatedTime?.getTime(),
    }))
);
