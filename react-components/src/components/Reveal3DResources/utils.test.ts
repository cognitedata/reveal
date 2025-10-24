import { describe, expect, test } from 'vitest';
import { getInstanceKeysFromStylingGroup, getInstanceReferencesFromStylingGroup } from './utils';
import { createFdmKey } from '../CacheProvider';

describe(getInstanceKeysFromStylingGroup.name, () => {
  test('returns all ids for classic styling group', () => {
    const assetIdList = [1, 3, 4, 2];
    const result = getInstanceKeysFromStylingGroup({ assetIds: assetIdList, style: {} });
    expect(result).toEqual(assetIdList);
  });

  test('returns all ids for dm styling group', () => {
    const dmsIdList = [
      { externalId: 'external-id', space: 'space' },
      { externalId: 'another-external-id', space: 'another-space' }
    ];
    const result = getInstanceKeysFromStylingGroup({ fdmAssetExternalIds: dmsIdList, style: {} });
    expect(result).toEqual(dmsIdList.map(createFdmKey));
  });
});
