/*!
 * Copyright 2025 Cognite AS
 */

import { type NodeAppearance } from '@cognite/reveal';
import { type ModelStyleGroupWithMappingsFetched, type CadModelOptions } from '../types';
import { useMemo } from 'react';
import { useMappedEdgesForRevisions, useAssetMappedNodesForRevisions, ModelWithAssetMappings } from '../../../hooks';
import { getMappedStyleGroupFromAssetMappings } from './utils/getMappedStyleGroupFromAssetMappings';
import { getMappedStyleGroupFromFdm } from './utils/getMappedStyleGroupFromFdm';
import { getMappedCadModelsOptions } from './utils/getMappedCadModelsOptions';
import { groupStyleGroupByModel } from './utils/groupStyleGroupByModel';

export function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroupWithMappingsFetched {
  const modelsRevisionsWithMappedEquipment = useMemo(
    () => getMappedCadModelsOptions(defaultMappedNodeAppearance, models),
    [models, defaultMappedNodeAppearance]
  );
  const {
    data: mappedEquipmentEdges,
    isLoading: isFDMEquipmentMappingsLoading,
    isFetched: isFDMEquipmentMappingsFetched,
    isError: isFDMEquipmentMappingsError
  } = useMappedEdgesForRevisions(modelsRevisionsWithMappedEquipment);

  const {
    data: assetMappingData,
    isLoading: isAssetMappingsLoading,
    isFetched: isAssetMappingsFetched,
    isError: isAssetMappingsError
  } = useAssetMappedNodesForRevisions(modelsRevisionsWithMappedEquipment);

  const modelsMappedFdmStyleGroups = useMemo(() => {
    const isFdmMappingUnavailableOrLoading =
      models.length === 0 ||
      mappedEquipmentEdges === undefined ||
      mappedEquipmentEdges.size === 0 ||
      isFDMEquipmentMappingsLoading;

    if (isFdmMappingUnavailableOrLoading) {
      return [];
    }

    return modelsRevisionsWithMappedEquipment.map((model) => {
      const fdmData =
        mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];
      const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromFdm(fdmData, modelStyle)]
          : [];
      return { model, styleGroup };
    });
  }, [
    modelsRevisionsWithMappedEquipment,
    mappedEquipmentEdges,
    defaultMappedNodeAppearance,
    isFDMEquipmentMappingsLoading
  ]);

  const modelsMappedAssetStyleGroups = useMemo(() => {
    const isAssetMappingUnavailableOrLoading =
      models.length === 0 ||
      assetMappingData === undefined ||
      assetMappingData.length === 0 ||
      isAssetMappingsLoading;

    if (isAssetMappingUnavailableOrLoading) {
      return [];
    }

    return assetMappingData.map((assetMappedModel: ModelWithAssetMappings) => {
      const modelStyle = assetMappedModel.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAssetMappings(assetMappedModel.assetMappings, modelStyle)]
          : [];
      return { model: assetMappedModel.model, styleGroup };
    });
  }, [
    modelsRevisionsWithMappedEquipment,
    assetMappingData,
    defaultMappedNodeAppearance,
    isAssetMappingsLoading
  ]);

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...modelsMappedAssetStyleGroups,
        ...modelsMappedFdmStyleGroups
      ]),
    [modelsMappedAssetStyleGroups, modelsMappedFdmStyleGroups]
  );

  const isModelMappingsLoading =
    (!isFDMEquipmentMappingsError &&
      isFDMEquipmentMappingsLoading &&
      !isFDMEquipmentMappingsFetched) ||
    (!isAssetMappingsError && isAssetMappingsLoading && !isAssetMappingsFetched);

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading
  };
}
