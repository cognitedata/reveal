import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { type InstanceStylingGroup } from './types';
import { type InstanceId, InstanceKey } from '../../utilities/instanceIds';
import { assertNever } from '../../utilities/assertNever';
import { createInstanceKey } from '../CacheProvider/idAndKeyTranslation';

export function getInstanceKeysFromStylingGroup(stylingGroup: InstanceStylingGroup): InstanceKey[] {
  return getInstanceReferencesFromStylingGroup(stylingGroup).map(createInstanceKey);
}

export function getInstanceReferencesFromStylingGroup(
  stylingGroup: InstanceStylingGroup
): InstanceId[] {
  if (isClassicAssetMappingStylingGroup(stylingGroup)) {
    return stylingGroup.assetIds;
  } else if (isFdmAssetStylingGroup(stylingGroup)) {
    return stylingGroup.fdmAssetExternalIds;
  }

  assertNever(stylingGroup);
}
