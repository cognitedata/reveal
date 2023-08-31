/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../components/Reveal3DResources/types';
import { type NodeAppearance } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import {
  useFdmAssetMappings,
  useMappedEdgesForRevisions
} from '../components/NodeCacheProvider/NodeCacheProvider';
import { useMemo } from 'react';
import { NodeId, type FdmEdgeWithNode, type TreeIndex } from '../components/NodeCacheProvider/types';
import {
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
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
  const modelsRevisionsWithMappedEquipment = useMemo(() => getMappedCadModelsOptions(), [models]);
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
    return modelsRevisionsWithMappedEquipment.map((model) => {
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];
      const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup = modelStyle !== undefined ? [getMappedStyleGroup(fdmData, modelStyle)] : [];
      return { model, styleGroup };
    });
  }, [modelsRevisionsWithMappedEquipment, mappedEquipmentEdges, defaultMappedNodeAppearance]);

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
  const { data: fdmAssetMappings } = useFdmAssetMappings(
    instanceGroups.flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const modelInstanceStyleGroups = useMemo(() => {
    if (models.length === 0 || fdmAssetMappings === undefined) {
      return [];
    }
    return models.map((model) => {
      const styleGroup =
        fdmAssetMappings !== undefined
          ? calculateCadModelStyling(instanceGroups, fdmAssetMappings, model)
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappings]);

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
  edges: FdmEdgeWithNode[],
  mapped: NodeAppearance
): TreeIndexStylingGroup {
  const treeIndices = edges.flatMap((edge) => {
    const treeIndices = getNodeSubtreeIndices(edge.node);
    return treeIndices;
  });
  return { treeIndices, style: mapped };
}

function calculateCadModelStyling(
  stylingGroups: FdmAssetStylingGroup[],
  mappings: ThreeDModelMappings[],
  model: CadModelOptions
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  const resourcesStylingGroups = stylingGroups;

  return resourcesStylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodeLists = resourcesGroup.fdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(uniqueId.externalId))
        .filter((nodeMap): nodeMap is Map<NodeId, Node3D> => nodeMap !== undefined)
        .map(nodeMap => [...nodeMap.values()]);
      return {
        style: resourcesGroup.style.cad,
        treeIndices: modelMappedNodeLists.flatMap((nodes) => nodes.flatMap(n => getNodeSubtreeIndices(n)))
      };
    })
    .filter((group) => group.treeIndices.length > 0);
}

function getNodeSubtreeIndices(node: Node3D): TreeIndex[] {
  return [...Array(node.subtreeSize).keys()].map((i) => i + node.treeIndex);
}

function getModelMappings(
  mappings: ThreeDModelMappings[],
  model: CadModelOptions
): Map<CogniteExternalId, Map<NodeId, Node3D>> {
  return mappings
    .filter(
      (mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
    )
    .reduce(
      // reduce is added to avoid duplication of a models that span several pages.
      (acc, mapping) => {
        mergeMapsWithDeduplicatedNodes(acc.mappings, mapping.mappings);
        return acc;
      },
      { modelId: model.modelId, revisionId: model.revisionId, mappings: new Map<string, Map<NodeId, Node3D>>() }
    ).mappings;
}

function mergeMapsWithDeduplicatedNodes(
  targetMap: Map<string, Map<NodeId, Node3D>>,
  addedMap: Map<string, Node3D[]>
): Map<string, Map<NodeId, Node3D>> {
  addedMap.forEach((nodesToAdd, fdmKey) => {
    const targetSet = targetMap.get(fdmKey);
    if (targetSet !== undefined) {
      nodesToAdd.forEach(node => targetSet.set(node.id, node));
    } else {
      targetMap.set(fdmKey, new Map(nodesToAdd.map(node => [node.id, node])));
    }
  });

  return targetMap;
}
