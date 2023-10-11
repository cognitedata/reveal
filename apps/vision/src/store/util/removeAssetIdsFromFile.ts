import { VisionAsset } from '../../modules/Common/store/files/types';
import { fetchAssets } from '../thunks/fetchAssets';
import { UpdateFiles } from '../thunks/Files/UpdateFiles';

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
