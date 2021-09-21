import { createAsyncThunk } from '@reduxjs/toolkit';
import { IdEither, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { VisionAsset } from 'src/modules/Common/store/filesSlice';
import { ThunkConfig } from 'src/store/rootReducer';

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
