import {
  type FdmInstanceStylingGroup,
  type ClassicAssetStylingGroup,
  type Image360AssetStylingGroup,
  type InstanceStylingGroup,
  type Image360DMAssetStylingGroup
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

export function isImage360AssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360AssetStylingGroup {
  return (instanceGroup as Image360AssetStylingGroup).assetIds !== undefined;
}

export function isImage360DMAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360DMAssetStylingGroup {
  return (instanceGroup as Image360DMAssetStylingGroup).assetRefs !== undefined;
}

export function isImage360AssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360AssetStylingGroup | Image360DMAssetStylingGroup {
  return isImage360AssetStylingGroup(instanceGroup) || isImage360DMAssetStylingGroup(instanceGroup);
}

export function isAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmInstanceStylingGroup | ClassicAssetStylingGroup {
  return isClassicAssetMappingStylingGroup(instanceGroup) || isFdmAssetStylingGroup(instanceGroup);
}
