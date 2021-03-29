import { createAsyncThunk } from '@reduxjs/toolkit';
import { IdEither, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { VisionAsset } from 'src/store/uploadedFilesSlice';

export const fetchAssets = createAsyncThunk<
  VisionAsset[],
  IdEither[],
  ThunkConfig
>('fetchAssets', async (assetIds) => {
  const assets = await sdk.assets.retrieve(assetIds);
  return assets.map((asset) => ({
    ...asset,
    createdTime: asset.createdTime.getTime(),
    lastUpdatedTime: asset.lastUpdatedTime && asset.lastUpdatedTime.getTime(),
  }));
});
