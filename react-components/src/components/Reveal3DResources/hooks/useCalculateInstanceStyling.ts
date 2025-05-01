/*!
 * Copyright 2025 Cognite AS
 */
import { useMemo } from 'react';

import { useFdmAssetMappings, useNodesForAssets } from '../../../hooks';
import { useHybridAssetMappings } from '../../../hooks/cad/useHybridAssetMappings';
import {
  isFdmAssetStylingGroup,
  isClassicAssetMappingStylingGroup,
  isHybridFdmAssetStylingGroup
} from '../../../utilities/StylingGroupUtils';
import {
  AssetStylingGroup,
  CadModelOptions,
  FdmAssetStylingGroup,
  HybridFdmAssetStylingGroup,
  type ModelStyleGroupWithMappingsFetched
} from '../types';
import { useAssetMappingInstanceStyleGroups } from './useAssetMappingInstanceStyleGroups';
import { useFdmInstanceStyleGroups } from './useFdmInstanceStyleGroups';
import { useHybridFdmInstanceStyleGroups } from './useHybridFdmInstanceStyleGroups';
import { groupStyleGroupByModel } from './utils/groupStyleGroupByModel';

export function useCalculateInstanceStyling(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>
): ModelStyleGroupWithMappingsFetched {
  const { data: fdmAssetMappings } = useFdmAssetMappings(
    instanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const assetIdsFromInstanceGroups = instanceGroups
    .filter(isClassicAssetMappingStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.assetIds);

  const hybridFdmAssetFromInstanceGroups = instanceGroups
    .filter(isHybridFdmAssetStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.hybridFdmAssetExternalIds);

  const {
    data: modelAssetMappings,
    isLoading: isModelMappingsLoading,
    isFetched: isModelMappingsFetched,
    isError: isModelMappingsError
  } = useNodesForAssets(models, assetIdsFromInstanceGroups);

  const { data: modelHybridAssetMappings } = useHybridAssetMappings(
    hybridFdmAssetFromInstanceGroups,
    models
  );

  const fdmModelInstanceStyleGroups = useFdmInstanceStyleGroups(
    models,
    instanceGroups,
    fdmAssetMappings
  );

  const assetMappingInstanceStyleGroups = useAssetMappingInstanceStyleGroups(
    models,
    instanceGroups,
    modelAssetMappings
  );

  const hybridAssetMappingInstanceStyleGroups = useHybridFdmInstanceStyleGroups(
    models,
    instanceGroups,
    modelHybridAssetMappings
  );

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...fdmModelInstanceStyleGroups,
        ...assetMappingInstanceStyleGroups,
        ...hybridAssetMappingInstanceStyleGroups
      ]),
    [
      fdmModelInstanceStyleGroups,
      assetMappingInstanceStyleGroups,
      hybridAssetMappingInstanceStyleGroups
    ]
  );

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading: isModelMappingsLoading && !isModelMappingsFetched,
    isModelMappingsError
  };
}
