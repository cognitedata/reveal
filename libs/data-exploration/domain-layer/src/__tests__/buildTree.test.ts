import { assetsFixture, rootAssetFixture } from '@data-exploration-lib/core';

import { buildTree } from '../assets/service/utils/buildTree';

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    isSupportedFileInfo: jest.fn(() => true),
  };
});

describe('buildTree util function', () => {
  it('should build up asset tree correctly', () => {
    const [mockAsset, mockAsset2, mockAsset3] = assetsFixture;
    const [rootAsset1] = rootAssetFixture;

    const asset = mockAsset3;
    const assetMap = {
      [mockAsset.id]: mockAsset,
      [mockAsset2.id]: mockAsset2,
      [rootAsset1.id]: rootAsset1,
    };
    const result = buildTree(asset, assetMap);

    // rootAsset should be first
    expect(result.id).toEqual(rootAsset1.id);

    // children should be correct
    expect(result.children && result.children[0].id).toEqual(mockAsset.id);
    expect(
      result.children &&
        result.children[0].children &&
        result.children[0].children[0].id
    ).toEqual(mockAsset2.id);

    expect(
      result.children &&
        result.children[0].children &&
        result.children[0].children[0].children &&
        result.children[0].children[0].children[0].id
    ).toEqual(mockAsset3.id);
  });
});
