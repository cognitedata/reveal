import { disableAssetTable } from '@vision/modules/Common/Components/BulkEdit/Asset/disableAssetTable';
import { BulkEditUnsavedState } from '@vision/modules/Common/store/common/types';

describe('test disableAssetTable fn', () => {
  test('if assetIds undefined', () => {
    const bulkEditUnsaved: BulkEditUnsavedState = {
      assetIds: undefined,
    };
    expect(disableAssetTable({ bulkEditUnsaved })).toBe(true);
  });

  describe('if assetIds defined', () => {
    test('addedAssetIds defined and not empty', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { addedAssetIds: [1, 2, 3] },
      };
      expect(disableAssetTable({ bulkEditUnsaved })).toBe(false);
    });

    test('addedAssetIds defined and is empty', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { addedAssetIds: [] },
      };
      expect(disableAssetTable({ bulkEditUnsaved })).toBe(true);
    });

    test('removedAssetIds defined and not empty', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { removedAssetIds: [1, 2, 3] },
      };
      expect(disableAssetTable({ bulkEditUnsaved })).toBe(false);
    });

    test('removedAssetIds defined and is empty', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { removedAssetIds: [] },
      };
      expect(disableAssetTable({ bulkEditUnsaved })).toBe(true);
    });
  });
});
