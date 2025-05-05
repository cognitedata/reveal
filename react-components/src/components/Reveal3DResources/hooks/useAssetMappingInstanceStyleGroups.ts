/*!
 * Copyright 2025 Cognite AS
 */
import { useMemo } from 'react';
import {
  type CadModelOptions,
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type HybridFdmAssetStylingGroup
} from '..';
import { isClassicAssetMappingStylingGroup } from '../../../utilities/StylingGroupUtils';
import { type ModelRevisionAssetNodesResult } from '../../CacheProvider/types';
import { type ModelStyleGroup } from '../types';
import { calculateAssetMappingCadModelStyling } from './utils/calculateAssetMappingCadModelStyling';

export function useAssetMappingInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  modelAssetMappings: ModelRevisionAssetNodesResult[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (modelAssetMappings === undefined || modelAssetMappings.length === 0) {
      return [];
    }

    return models.map((model, index) => {
      return calculateAssetMappingCadModelStyling(
        instanceGroups.filter(isClassicAssetMappingStylingGroup),
        modelAssetMappings[index].assetToNodeMap,
        model
      );
    });
  }, [models, instanceGroups, modelAssetMappings]);
}
