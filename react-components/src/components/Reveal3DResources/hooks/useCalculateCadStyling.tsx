/*!
 * Copyright 2023 Cognite AS
 */
import {
  type HybridFdmAssetStylingGroup,
  type AssetStylingGroup,
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup,
  type StyledModelWithMappingsFetched
} from '../types';
import { useCalculateInstanceStyling } from './useCalculateInstanceStyling';
import { useCalculateMappedStyling } from './useCalculateMappedStyling';
import { useJoinStylingGroups } from './useJoinStylingGroups';

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  defaultResourceStyling?: DefaultResourceStyling
): StyledModelWithMappingsFetched => {
  const modelsMappedStyleGroups = useCalculateMappedStyling(
    models,
    defaultResourceStyling?.cad?.mapped
  );
  const modelInstanceStyleGroupsAndMappingFetched = useCalculateInstanceStyling(
    models,
    instanceGroups
  );

  const joinedStyleGroups = useJoinStylingGroups(
    models,
    modelsMappedStyleGroups.combinedMappedStyleGroups,
    modelInstanceStyleGroupsAndMappingFetched.combinedMappedStyleGroups
  );

  return {
    styledModels: joinedStyleGroups,
    isModelMappingsLoading:
      modelInstanceStyleGroupsAndMappingFetched.isModelMappingsLoading ||
      modelsMappedStyleGroups.isModelMappingsLoading
  };
};
