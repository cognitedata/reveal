/*!
 * Copyright 2023 Cognite AS
 */
import {
  type AssetMappingStylingGroup,
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../components/Reveal3DResources/types';
import { NumericRange, type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type ThreeDModelFdmMappings } from './types';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import {
  useFdmAssetMappings,
  useMappedEdgesForRevisions
} from '../components/NodeCacheProvider/NodeCacheProvider';
import { useMemo } from 'react';
import {
  type NodeId,
  type FdmEdgeWithNode,
  type ModelRevisionKey,
  type AssetId,
  type ModelRevisionAssetNodesResult
} from '../components/NodeCacheProvider/types';
import {
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';
import { type AssetMapping } from '../components/NodeCacheProvider/AssetMappingCache';
import {
  useAssetMappedNodesForRevisions,
  useNodesForAssets
} from '../components/NodeCacheProvider/AssetMappingCacheProvider';

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
  instanceGroups: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>,
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

  const { data: assetMappingData } = useAssetMappedNodesForRevisions(
    modelsRevisionsWithMappedEquipment
  );

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
  instanceGroups: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>
): ModelStyleGroup[] {
  const { data: fdmAssetMappings } = useFdmAssetMappings(
    instanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const { data: modelAssetMappings } = useNodesForAssets(
    models,
    instanceGroups
      .filter(isAssetMappingStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.assetIds)
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

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel([...fdmModelInstanceStyleGroups, ...assetMappingInstanceStyleGroups]),
    [fdmModelInstanceStyleGroups, assetMappingInstanceStyleGroups]
  );

  return combinedMappedStyleGroups;
}

function useAssetMappingInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>,
  modelAssetMappings: ModelRevisionAssetNodesResult[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (modelAssetMappings === undefined || modelAssetMappings.length === 0) {
      return [];
    }

    return models.map((model, index) => {
      return calculateAssetMappingCadModelStyling(
        instanceGroups.filter(isAssetMappingStylingGroup),
        modelAssetMappings[index].assetToNodeMap,
        model
      );
    });
  }, [models, instanceGroups, modelAssetMappings]);
}

function useFdmInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetMappingStylingGroup>,
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

function isFdmAssetStylingGroup(instanceGroup: any): instanceGroup is FdmAssetStylingGroup {
  return instanceGroup.fdmAssetExternalIds !== undefined && instanceGroup.style !== undefined;
}

function isAssetMappingStylingGroup(instanceGroup: any): instanceGroup is AssetMappingStylingGroup {
  return instanceGroup.assetIds !== undefined && instanceGroup.style !== undefined;
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

function calculateFdmCadModelStyling(
  stylingGroups: FdmAssetStylingGroup[],
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  return stylingGroups
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

function calculateAssetMappingCadModelStyling(
  stylingGroups: AssetMappingStylingGroup[],
  nodeMap: Map<AssetId, Node3D>,
  model: CadModelOptions
): ModelStyleGroup {
  const treeIndexSetsWithStyle = stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      group.assetIds
        .map((assetId) => nodeMap.get(assetId))
        .filter((node): node is Node3D => node !== undefined)
        .forEach((node) => {
          indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
        });

      return {
        treeIndexSet: indexSet,
        style: group.style.cad
      };
    })
    .filter((setWithStyle) => setWithStyle.treeIndexSet.count > 0);

  return {
    model,
    styleGroup: treeIndexSetsWithStyle
  };
}

function getNodeSubtreeNumericRange(node: Node3D): NumericRange {
  return new NumericRange(node.treeIndex, node.subtreeSize);
}

function getModelMappings(
  mappings: ThreeDModelFdmMappings[],
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
