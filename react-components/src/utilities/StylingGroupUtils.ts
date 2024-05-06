/*!
 * Copyright 2024 Cognite AS
 */

import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type Image360AssetStylingGroup
} from '../components/Reveal3DResources/types';

export function isFdmAssetStylingGroup(instanceGroup: any): instanceGroup is FdmAssetStylingGroup {
  return instanceGroup.fdmAssetExternalIds !== undefined && instanceGroup.style !== undefined;
}

export function isAssetMappingStylingGroup(instanceGroup: any): instanceGroup is AssetStylingGroup {
  return instanceGroup.assetIds !== undefined && instanceGroup.style !== undefined;
}

export function isImage360AssetStylingGroup(
  instanceGroup: any
): instanceGroup is Image360AssetStylingGroup {
  return (
    instanceGroup.assetIds !== undefined &&
    instanceGroup.style !== undefined &&
    instanceGroup.style.image360 !== undefined
  );
}

export function isCadAssetMappingStylingGroup(
  instanceGroup: any
): instanceGroup is FdmAssetStylingGroup | AssetStylingGroup {
  return isAssetMappingStylingGroup(instanceGroup) || isFdmAssetStylingGroup(instanceGroup);
}
