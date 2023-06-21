import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { VisionAsset } from 'src/modules/Common/store/files/types';

export const removeAssetIdsFromFile = async (
  fileId: number,
  assetIds: number[],
  dispatch: any
) => {
  const assetResponse: VisionAsset[] = await dispatch(
    fetchAssets(assetIds.map((id) => ({ id })))
  ).unwrap();

  dispatch(
    UpdateFiles([
      {
        id: fileId,
        update: {
          assetIds: {
            remove: assetResponse.map((asset) => asset.id),
          },
        },
      },
    ])
  );
};
