/*!
 * Copyright 2024 Cognite AS
 */

import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type Image360AssetStylingGroup,
  type InstanceStylingGroup,
  type HybridFdmAssetStylingGroup
} from '../components/Reveal3DResources/types';

export function isFdmAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmAssetStylingGroup {
  return (instanceGroup as FdmAssetStylingGroup).fdmAssetExternalIds !== undefined;
}

export function isHybridFdmAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is HybridFdmAssetStylingGroup {
  return (instanceGroup as HybridFdmAssetStylingGroup).hybridFdmAssetExternalIds !== undefined;
}

export function isClassicAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is AssetStylingGroup {
  return (instanceGroup as AssetStylingGroup).assetIds !== undefined;
}

export function isImage360AssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360AssetStylingGroup {
  return (instanceGroup as Image360AssetStylingGroup).assetIds !== undefined;
}

export function isAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmAssetStylingGroup | AssetStylingGroup {
  return (
    isClassicAssetMappingStylingGroup(instanceGroup) ||
    isFdmAssetStylingGroup(instanceGroup) ||
    isHybridFdmAssetStylingGroup(instanceGroup)
  );
}
