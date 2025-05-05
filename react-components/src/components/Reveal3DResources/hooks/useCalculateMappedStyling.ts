/*!
 * Copyright 2025 Cognite AS
 */

import { type NodeAppearance } from '@cognite/reveal';
import { type ModelStyleGroupWithMappingsFetched, type CadModelOptions } from '../types';
import { useMemo } from 'react';
import { useMappedEdgesForRevisions, useAssetMappedNodesForRevisions, ModelWithAssetMappings } from '../../../hooks';
import { getMappedStyleGroupFromAssetMappings } from './utils/getMappedStyleGroupFromAssetMappings';
import { getMappedStyleGroupFromDmConnection } from './utils/getMappedStyleGroupFromDmConnection';
import { groupStyleGroupByModel } from './utils/groupStyleGroupByModel';

export function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroupWithMappingsFetched {
  const modelsRevisionsWithMappedEquipment = useMemo(
    () => {
      if (defaultMappedNodeAppearance !== undefined) {
        return models;
      }
      return models.filter((model) => model.styling?.mapped !== undefined);
    },
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
          ? [getMappedStyleGroupFromDmConnection(fdmData, modelStyle)]
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
    (isFDMEquipmentMappingsLoading &&
      !isFDMEquipmentMappingsFetched) ||
    (isAssetMappingsLoading && !isAssetMappingsFetched);

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading,
    isModelMappingsError: isFDMEquipmentMappingsError || isAssetMappingsError,
  };
}
