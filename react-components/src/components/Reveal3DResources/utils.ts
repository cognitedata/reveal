import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
  // isImage360AssetStylingGroup,
  // isImage360DMAssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { InstanceStylingGroup } from './types';
import { type FdmKey } from '../CacheProvider/types';
import { createFdmKey } from '../CacheProvider/idAndKeyTranslation';
import {
  createInstanceReferenceKey,
  InstanceId,
  InstanceReference,
  InstanceReferenceKey,
  isDmsInstance,
  isExternalId,
  isInternalId
} from '../../utilities/instanceIds';
import { assertNever } from '../../utilities/assertNever';

export function getInstanceKeysFromStylingGroup(
  stylingGroup: InstanceStylingGroup
): Array<InstanceReferenceKey> {
  return getInstanceReferencesFromStylingGroup(stylingGroup).map(createInstanceReferenceKey);
}

export function getInstanceReferencesFromStylingGroup(
  stylingGroup: InstanceStylingGroup
): Array<InstanceReference> {
  if (
    isClassicAssetMappingStylingGroup(stylingGroup) /* ||
    isImage360AssetStylingGroup(stylingGroup) */
  ) {
    return stylingGroup.assetIds.map((id) => ({ id }));
  } else if (isFdmAssetStylingGroup(stylingGroup)) {
    return stylingGroup.fdmAssetExternalIds;
  } /* else if (isImage360DMAssetStylingGroup(stylingGroup)) {
    return stylingGroup.assetRefs;
    } */

  assertNever(stylingGroup);
}

export function getInstanceIdsFromReferences(
  instanceReferences: InstanceReference[]
): InstanceId[] {
  return instanceReferences.reduce((acc, reference) => {
    if (isInternalId(reference)) {
      acc.push(reference.id);
    } else if (isDmsInstance(reference)) {
      acc.push(reference);
    }

    return acc;
  }, [] as InstanceId[]);
}
