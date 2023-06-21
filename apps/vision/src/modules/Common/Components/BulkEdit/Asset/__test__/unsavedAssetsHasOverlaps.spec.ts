import { unsavedAssetsHasOverlaps } from 'src/modules/Common/Components/BulkEdit/Asset/unsavedAssetsHasOverlaps';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';

describe('test disableAssetTable fn', () => {
  test('if assetIds undefined', () => {
    const bulkEditUnsaved: BulkEditUnsavedState = {
      assetIds: undefined,
    };
    expect(unsavedAssetsHasOverlaps({ bulkEditUnsaved })).toBe(false);
  });

  describe('if assetIds defined', () => {
    test('only addedAssetIds defined', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { addedAssetIds: [1, 2, 3] },
      };
      expect(unsavedAssetsHasOverlaps({ bulkEditUnsaved })).toBe(false);
    });
    test('only removedAssetIds defined', () => {
      const bulkEditUnsaved: BulkEditUnsavedState = {
        assetIds: { removedAssetIds: [1, 2, 3] },
      };
      expect(unsavedAssetsHasOverlaps({ bulkEditUnsaved })).toBe(false);
    });

    describe('both addedAssetIds and removedAssetIds are defined', () => {
      test("don't have overlaps", () => {
        const bulkEditUnsaved: BulkEditUnsavedState = {
          assetIds: { addedAssetIds: [1, 2, 3], removedAssetIds: [4, 5, 6] },
        };
        expect(unsavedAssetsHasOverlaps({ bulkEditUnsaved })).toBe(false);
      });

      test('have overlaps', () => {
        const bulkEditUnsaved: BulkEditUnsavedState = {
          assetIds: { addedAssetIds: [1, 2, 3], removedAssetIds: [3, 4, 5] },
        };
        expect(unsavedAssetsHasOverlaps({ bulkEditUnsaved })).toBe(true);
      });
    });
  });
});
