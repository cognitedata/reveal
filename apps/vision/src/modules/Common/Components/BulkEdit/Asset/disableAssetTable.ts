import { BulkEditUnsavedState } from '../../../store/common/types';

export const disableAssetTable = ({
  bulkEditUnsaved,
}: {
  bulkEditUnsaved: BulkEditUnsavedState;
}): boolean => {
  const { assetIds } = bulkEditUnsaved;
  if (assetIds) {
    const { addedAssetIds, removedAssetIds } = assetIds;
    if (addedAssetIds && addedAssetIds.length !== 0) {
      return false;
    }
    if (removedAssetIds && removedAssetIds.length !== 0) {
      return false;
    }
  }
  return true;
};
