/*!
 * Copyright 2025 Cognite AS
 */
import { useMemo } from 'react';

import { type ThreeDModelFdmMappings } from '../../../hooks';
import { isFdmAssetStylingGroup } from '../../../utilities/StylingGroupUtils';
import {
  AssetStylingGroup,
  CadModelOptions,
  FdmAssetStylingGroup,
  HybridFdmAssetStylingGroup,
  type ModelStyleGroup
} from '../types';
import { calculateFdmCadModelStyling } from './utils/calculateFdmCadModelStyling';

export function useFdmInstanceStyleGroups(
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
          ? calculateFdmCadModelStyling(
              instanceGroups.filter(isFdmAssetStylingGroup),
              fdmAssetMappings,
              model
            )
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappings]);
}
