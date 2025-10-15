import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { type InstanceStylingGroup } from './types';
import {
  createInstanceReferenceKey,
  type InstanceId,
  type InstanceReference,
  type InstanceReferenceKey,
  isDmsInstance,
  isInternalId
} from '../../utilities/instanceIds';
import { assertNever } from '../../utilities/assertNever';

export function getInstanceKeysFromStylingGroup(
  stylingGroup: InstanceStylingGroup
): InstanceReferenceKey[] {
  return getInstanceReferencesFromStylingGroup(stylingGroup).map(createInstanceReferenceKey);
}

export function getInstanceReferencesFromStylingGroup(
  stylingGroup: InstanceStylingGroup
): InstanceReference[] {
  if (isClassicAssetMappingStylingGroup(stylingGroup)) {
    return stylingGroup.assetIds.map((id) => ({ id }));
  } else if (isFdmAssetStylingGroup(stylingGroup)) {
    return stylingGroup.fdmAssetExternalIds;
  }

  assertNever(stylingGroup);
}

export function getInstanceIdsFromReferences(
  instanceReferences: InstanceReference[]
): InstanceId[] {
  return instanceReferences.reduce<InstanceId[]>((acc, reference) => {
    if (isInternalId(reference)) {
      acc.push(reference.id);
    } else if (isDmsInstance(reference)) {
      acc.push(reference);
    }

    return acc;
  }, []);
}
