import { filterAssetIdsLinkedToGivenFile } from 'src/api/utils/filterAssetIdsLinkedToGivenFile';
import sdk from '@cognite/cdf-sdk-singleton';

jest.mock('@cognite/cdf-sdk-singleton');

describe('Test filterAssetIdsLinkedToGivenFile', () => {
  test('should gracefully handle if fileId or asset ids not available', async () => {
    const assetIds = await filterAssetIdsLinkedToGivenFile([], 3);
    expect(assetIds).toEqual([]);

    const assetIdsForInvalidFile = await filterAssetIdsLinkedToGivenFile(
      [1],
      0
    );
    expect(assetIdsForInvalidFile).toEqual([]);
  });

  test('should reject invalid assetIds', async () => {
    const assetIds = await filterAssetIdsLinkedToGivenFile([2, 3], 3);
    expect(assetIds).toEqual([]);
  });

  test('should select valid assetIds', async () => {
    const assetIds = await filterAssetIdsLinkedToGivenFile([1, 2], 3);
    expect(assetIds).toEqual([1]);
  });

  test('should handle exception', async () => {
    sdk.files.retrieve = async () =>
      Promise.reject(new Error('file not found!'));

    await expect(filterAssetIdsLinkedToGivenFile([1, 2], 3)).rejects.toThrow(
      'file not found!'
    );
  });
});
