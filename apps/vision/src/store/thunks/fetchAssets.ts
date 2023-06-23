import { createAsyncThunk } from '@reduxjs/toolkit';
import { VisionAsset } from '@vision/modules/Common/store/files/types';
import { ThunkConfig } from '@vision/store/rootReducer';

import sdk from '@cognite/cdf-sdk-singleton';
import { IdEither } from '@cognite/sdk';

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
