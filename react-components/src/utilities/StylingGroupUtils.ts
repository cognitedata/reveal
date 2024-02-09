/*!
 * Copyright 2024 Cognite AS
 */

import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup
} from '../components/Reveal3DResources/types';

export function isFdmAssetStylingGroup(instanceGroup: any): instanceGroup is FdmAssetStylingGroup {
  return instanceGroup.fdmAssetExternalIds !== undefined && instanceGroup.style !== undefined;
}

export function isAssetMappingStylingGroup(instanceGroup: any): instanceGroup is AssetStylingGroup {
  return instanceGroup.assetIds !== undefined && instanceGroup.style !== undefined;
}
