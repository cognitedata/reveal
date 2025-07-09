import { isClassicAssetMappingStylingGroup } from '../../utilities/StylingGroupUtils';
import { type FdmAssetStylingGroup, type AssetStylingGroup } from './types';
import { type AssetId, type FdmKey } from '../CacheProvider/types';
import { createFdmKey } from '../CacheProvider/idAndKeyTranslation';

export function getInstanceKeysFromStylingGroup(
  stylingGroup: FdmAssetStylingGroup | AssetStylingGroup
): Array<AssetId | FdmKey> {
  if (isClassicAssetMappingStylingGroup(stylingGroup)) {
    return stylingGroup.assetIds;
  } else {
    return stylingGroup.fdmAssetExternalIds.map(createFdmKey);
  }
}
