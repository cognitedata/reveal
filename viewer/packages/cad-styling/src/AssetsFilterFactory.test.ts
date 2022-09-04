/*!
 * Copyright 2022 Cognite AS
 */
import { Asset } from '@cognite/sdk';
import { AssetsFilterFactory } from './AssetsFilterFactory';

describe(AssetsFilterFactory.name, () => {
  test('createAssetHasOneOfLabelsFilter accepts correct', async () => {
    const filter = AssetsFilterFactory.createAssetHasOneOfLabelsFilter(['lorem', 'ipsum']);
    const assets: Asset[] = [
      createAssetWithLabels('lorem'),
      createAssetWithLabels('lorem', 'ipsum'),
      createAssetWithLabels('LOREM'),
      createAssetWithLabels('foo', 'bar'),
      createAssetWithLabels()
    ];

    const accepted = await filter(assets);

    expect(accepted).toEqual([assets[0], assets[1]]);
  });
});

function createAssetWithLabels(...labels: string[]): Asset {
  const asset: Asset = {
    rootId: 0,
    name: 'SomeAsset',
    id: 0,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    labels: labels.map(x => ({ externalId: x }))
  };
  return asset;
}
