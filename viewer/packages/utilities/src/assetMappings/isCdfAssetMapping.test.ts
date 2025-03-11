/*!
 * Copyright 2025 Cognite AS
 */
import { isCdfAssetMapping } from './isCdfAssetMapping';

describe(isCdfAssetMapping.name, () => {
  test('correctly recognizes a CDF asset mapping', () => {
    expect(
      isCdfAssetMapping({
        assetId: 123,
        nodeId: 345,
        treeIndex: 3,
        subtreeSize: 2
      })
    ).toBe(true);
  });

  test('correctly recognizes that an incomplete mapping is not a CDF asset mapping', () => {
    expect(
      isCdfAssetMapping({
        assetId: 123,
        nodeId: 234
      })
    ).toBe(false);
  });
});
