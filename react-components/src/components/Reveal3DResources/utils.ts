import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { InstanceStylingGroup } from './types';
import {
  createInstanceReferenceKey,
  InstanceId,
  InstanceReference,
  InstanceReferenceKey,
  isDmsInstance,
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
  return instanceReferences.reduce((acc, reference) => {
    if (isInternalId(reference)) {
      acc.push(reference.id);
    } else if (isDmsInstance(reference)) {
      acc.push(reference);
    }

    return acc;
  }, [] as InstanceId[]);
}
