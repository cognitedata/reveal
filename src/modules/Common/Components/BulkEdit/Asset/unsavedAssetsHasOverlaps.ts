import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';

export const unsavedAssetsHasOverlaps = ({
  bulkEditUnsaved,
}: {
  bulkEditUnsaved: BulkEditUnsavedState;
}): boolean => {
  if (bulkEditUnsaved.assetIds) {
    const { addedAssetIds, removedAssetIds } = bulkEditUnsaved.assetIds;
    if (addedAssetIds && removedAssetIds) {
      return (
        addedAssetIds.filter((id) => removedAssetIds.includes(id)).length !== 0
      );
    }
  }
  return false;
};
