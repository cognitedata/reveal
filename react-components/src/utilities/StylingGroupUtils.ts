import {
  type FdmInstanceStylingGroup,
  type ClassicAssetStylingGroup,
  type InstanceStylingGroup
} from '../components/Reveal3DResources/types';

export function isFdmAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmInstanceStylingGroup {
  return (instanceGroup as FdmInstanceStylingGroup).fdmAssetExternalIds !== undefined;
}

export function isClassicAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is ClassicAssetStylingGroup {
  return (instanceGroup as ClassicAssetStylingGroup).assetIds !== undefined;
}

export function isAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmInstanceStylingGroup | ClassicAssetStylingGroup {
  return isClassicAssetMappingStylingGroup(instanceGroup) || isFdmAssetStylingGroup(instanceGroup);
}
