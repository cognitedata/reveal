/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../components/Reveal3DResources/types';
import { type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type EdgeItem } from '../utilities/FdmSDK';
import { type NodeAppearance } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type CogniteExternalId, type CogniteInternalId } from '@cognite/sdk';
import { useFdmAssetMappings } from './useFdmAssetMappings';
import { useEffect, useMemo } from 'react';
import { useMappedEdgesForRevisions } from '../components/NodeCacheProvider/NodeCacheProvider';
import {
  type TreeIndexStylingGroup,
  type NodeStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: NodeStylingGroup[];
};

export type CadStyleGroup = NodeStylingGroup | TreeIndexStylingGroup;

export type StyledModel = {
  model: CadModelOptions;
  styleGroups: CadStyleGroup[];
};

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: FdmAssetStylingGroup[],
  defaultResourceStyling?: DefaultResourceStyling
): StyledModel[] => {
  const modelsMappedStyleGroups = useCalculateMappedStyling(
    models,
    defaultResourceStyling?.cad?.mapped
  );
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);
  const joinedStyleGroups = useJoinStylingGroups(
    models,
    modelsMappedStyleGroups,
    modelInstanceStyleGroups
  );
  return joinedStyleGroups;
};

function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroup[] {
  const modelsRevisionsWithMappedEquipment = getMappedCadModelsOptions();
  const { data: mappedEquipmentEdges } = useMappedEdgesForRevisions(
    modelsRevisionsWithMappedEquipment
  );

  const modelsMappedStyleGroups = useMemo(() => {
    if (
      models.length === 0 ||
      mappedEquipmentEdges === undefined ||
      mappedEquipmentEdges.size === 0
    ) {
      return [];
    }
    return models.map((model) => {
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}-${model.revisionId}`) ?? [];
      const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined
          ? [
              getMappedStyleGroup(
                fdmData.map((data) => data.edge),
                modelStyle
              )
            ]
          : [];
      return { model, styleGroup };
    });
  }, [models, mappedEquipmentEdges, defaultMappedNodeAppearance]);

  return modelsMappedStyleGroups;

  function getMappedCadModelsOptions(): CadModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
}

function useCalculateInstanceStyling(
  models: CadModelOptions[],
  instanceGroups: FdmAssetStylingGroup[]
): ModelStyleGroup[] {
  const {
    data: fdmAssetMappingsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useFdmAssetMappings(
    instanceGroups.flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  useEffect(() => {
    if (hasNextPage !== undefined && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const modelInstanceStyleGroups = useMemo(() => {
    if (models.length === 0 || fdmAssetMappingsData?.pages === undefined) {
      return [];
    }
    const fdmAssetMappings = fdmAssetMappingsData.pages.flatMap((page) => page.items);
    return models.map((model) => {
      const styleGroup =
        fdmAssetMappings !== undefined
          ? calculateCadModelStyling(instanceGroups, fdmAssetMappings, model)
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappingsData]);

  return modelInstanceStyleGroups;
}

function useJoinStylingGroups(
  models: CadModelOptions[],
  modelsMappedStyleGroups: ModelStyleGroup[],
  modelInstanceStyleGroups: ModelStyleGroup[]
): StyledModel[] {
  const modelsStyling = useMemo(() => {
    if (modelInstanceStyleGroups.length === 0 && modelsMappedStyleGroups.length === 0) {
      return extractDefaultStyles(models);
    }
    return models.map((model) => {
      const mappedStyleGroup =
        modelsMappedStyleGroups.find((typedModel) => typedModel.model === model)?.styleGroup ?? [];
      const instanceStyleGroups = modelInstanceStyleGroups
        .filter((typedModel) => typedModel.model === model)
        .flatMap((typedModel) => typedModel.styleGroup);
      return {
        model,
        styleGroups: [...mappedStyleGroup, ...instanceStyleGroups]
      };
    });
  }, [models, modelInstanceStyleGroups, modelsMappedStyleGroups]);

  return modelsStyling;
}

function extractDefaultStyles(typedModels: CadModelOptions[]): StyledModel[] {
  return typedModels.map((model) => {
    return {
      model,
      styleGroups: []
    };
  });
}

function getMappedStyleGroup(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  mapped: NodeAppearance
): NodeStylingGroup {
  const nodeIds = edges.map((p) => p.properties.revisionNodeId);
  return { nodeIds, style: mapped };
}

function calculateCadModelStyling(
  stylingGroups: FdmAssetStylingGroup[],
  mappings: ThreeDModelMappings[],
  model: CadModelOptions
): NodeStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  const resourcesStylingGroups = stylingGroups;

  return resourcesStylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodeIds = resourcesGroup.fdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(uniqueId.externalId))
        .filter((nodeId): nodeId is number => nodeId !== undefined);
      return {
        style: resourcesGroup.style.cad,
        nodeIds: modelMappedNodeIds
      };
    })
    .filter((group) => group.nodeIds.length > 0);
}

function getModelMappings(
  mappings: ThreeDModelMappings[],
  model: CadModelOptions
): Map<CogniteExternalId, CogniteInternalId> {
  return mappings
    .filter(
      (mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
    )
    .reduce(
      // reduce is added to avoid duplication of a models that span several pages.
      (acc, mapping) => {
        mergeMaps(acc.mappings, mapping.mappings);
        return acc;
      },
      { modelId: model.modelId, revisionId: model.revisionId, mappings: new Map<string, number>() }
    ).mappings;
}

function mergeMaps(
  targetMap: Map<string, number>,
  addedMap: Map<string, number>
): Map<string, number> {
  addedMap.forEach((value, key) => targetMap.set(key, value));

  return targetMap;
}
