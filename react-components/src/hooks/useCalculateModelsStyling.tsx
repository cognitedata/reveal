/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../components/Reveal3DResources/types';
import { NumericRange, type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import {
  useFdmAssetMappings,
  useMappedEdgesForRevisions
} from '../components/NodeCacheProvider/NodeCacheProvider';
import { useMemo } from 'react';
import {
  type NodeId,
  type FdmEdgeWithNode,
  type ModelRevisionKey
} from '../components/NodeCacheProvider/types';
import {
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';
import { useAssetMappeNodesForRevisions } from '../components/NodeCacheProvider/AssetMappingCacheProvider';
import { AssetMapping } from '../components/NodeCacheProvider/AssetMappingCache';

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

  const { data: assetMappingData } = useAssetMappeNodesForRevisions(modelsRevisionsWithMappedEquipment);

  const modelsMappedFdmStyleGroups = useMemo(() => {
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

      const styleGroup =
        modelStyle !== undefined ? [getMappedStyleGroupFromFdm(fdmData, modelStyle)] : [];
      return { model, styleGroup };
    });
  }, [modelsRevisionsWithMappedEquipment, mappedEquipmentEdges, defaultMappedNodeAppearance]);

  const modelsMappedAssetStyleGroups = useMemo(() => {
    if (models.length === 0 || assetMappingData === undefined || assetMappingData.length === 0) {
      return [];
    }

    return assetMappingData.map((assetMappedModel) => {
      const modelStyle = assetMappedModel.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAssetMappings(assetMappedModel.assetMappings, modelStyle)]
          : [];
      return { model: assetMappedModel.model, styleGroup };
    });
  }, [modelsRevisionsWithMappedEquipment, assetMappingData, defaultMappedNodeAppearance]);

  const combinedMappedStyleGroups = useMemo(
    () => groupStyleGroupByModel([...modelsMappedAssetStyleGroups, ...modelsMappedFdmStyleGroups]),
    [modelsMappedAssetStyleGroups, modelsMappedFdmStyleGroups]
  );

  return combinedMappedStyleGroups;

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

function groupStyleGroupByModel(styleGroup: ModelStyleGroup[]): ModelStyleGroup[] {
  const auxillaryMap = new Map<ModelRevisionKey, ModelStyleGroup>();

  styleGroup.forEach(({ model, styleGroup }) => {
    const key = `${model.modelId}/${model.revisionId}` as const;
    const storedGroup = auxillaryMap.get(key);
    if (storedGroup !== undefined) {
      storedGroup.styleGroup.push(...styleGroup);
    } else {
      auxillaryMap.set(key, { model, styleGroup });
    }
  });

  return [...auxillaryMap.values()];
}

function extractDefaultStyles(typedModels: CadModelOptions[]): StyledModel[] {
  return typedModels.map((model) => {
    return {
      model,
      styleGroups: []
    };
  });
}

function getMappedStyleGroupFromFdm(
  edges: FdmEdgeWithNode[],
  mapped: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  edges.forEach((edge) => {
    const treeIndexRange = getNodeSubtreeNumericRange(edge.cadNode);
    indexSet.addRange(treeIndexRange);
  });

  return { treeIndexSet: indexSet, style: mapped };
}

function getMappedStyleGroupFromAssetMappings(
  assetMappings: AssetMapping[],
  nodeAppearance: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  assetMappings.forEach((assetMapping) => {
    const range = new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize);
    indexSet.addRange(range);
  });

  return { treeIndexSet: indexSet, style: nodeAppearance };
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
        .map((nodeMap) => [...nodeMap.values()]);

      const indexSet = new IndexSet();
      modelMappedNodeLists.forEach((nodes) => {
        nodes.forEach((n) => {
          indexSet.addRange(getNodeSubtreeNumericRange(n));
        });
      });

      return {
        style: resourcesGroup.style.cad,
        treeIndexSet: indexSet
      };
    })
    .filter((group) => group.treeIndexSet.count > 0);
}

function getNodeSubtreeNumericRange(node: Node3D): NumericRange {
  return new NumericRange(node.treeIndex, node.subtreeSize);
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
      {
        modelId: model.modelId,
        revisionId: model.revisionId,
        mappings: new Map<string, Map<NodeId, Node3D>>()
      }
    ).mappings;
}

function mergeMapsWithDeduplicatedNodes(
  targetMap: Map<string, Map<NodeId, Node3D>>,
  addedMap: Map<string, Node3D[]>
): Map<string, Map<NodeId, Node3D>> {
  return [...addedMap.entries()].reduce((map, [fdmKey, nodesToAdd]) => {
    const targetSet = map.get(fdmKey);

    if (targetSet !== undefined) {
      nodesToAdd.forEach((node) => targetSet.set(node.id, node));
    } else {
      map.set(fdmKey, new Map(nodesToAdd.map((node) => [node.id, node])));
    }

    return map;
  }, targetMap);
}
