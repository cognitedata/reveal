/*!
 * Copyright 2025 Cognite AS
 */
import { useMemo } from 'react';

import { type ThreeDModelFdmMappings } from '../../../hooks';
import { isHybridFdmAssetStylingGroup } from '../../../utilities/StylingGroupUtils';
import {
  AssetStylingGroup,
  CadModelOptions,
  FdmAssetStylingGroup,
  HybridFdmAssetStylingGroup,
  type ModelStyleGroup
} from '../types';
import { calculateHybridAssetMappingCadModelStyling } from './utils/calculateHybridAssetMappingCadModelStyling';

export function useHybridFdmInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  fdmAssetMappings: ThreeDModelFdmMappings[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (models.length === 0 || fdmAssetMappings === undefined) {
      return [];
    }
    return models.map((model) => {
      const styleGroup =
        fdmAssetMappings !== undefined
          ? calculateHybridAssetMappingCadModelStyling(
              instanceGroups.filter(isHybridFdmAssetStylingGroup),
              fdmAssetMappings,
              model
            )
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappings]);
}
