/*!
 * Copyright 2023 Cognite AS
 */
import {
  type AssetStylingGroup,
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
} from '../components/CacheProvider/NodeCacheProvider';
import { useMemo } from 'react';
import {
  type NodeId,
  type FdmEdgeWithNode,
  type AssetId,
  type ModelRevisionAssetNodesResult
} from '../components/CacheProvider/types';
import {
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';
import { type AssetMapping } from '../components/CacheProvider/AssetMappingCache';
import {
  useAssetMappedNodesForRevisions,
  useNodesForAssets
} from '../components/CacheProvider/AssetMappingCacheProvider';
import { isSameModel } from '../utilities/isSameModel';
import { isAssetMappingStylingGroup, isFdmAssetStylingGroup } from '../utilities/StylingGroupUtils';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

type ModelStyleGroupWithMappingsFetched = {
  combinedMappedStyleGroups: ModelStyleGroup[];
  modelMappingsIsFetched: boolean;
  modelMappingsIsLoading: boolean;
};

type StyledModelWithMappingsFetched = {
  styledModels: StyledModel[];
  modelMappingsIsFetched: boolean;
  modelMappingsIsLoading: boolean;
};

export type CadStyleGroup = NodeStylingGroup | TreeIndexStylingGroup;

export type StyledModel = {
  model: CadModelOptions;
  styleGroups: CadStyleGroup[];
};

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
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
    modelsMappedStyleGroups,
    modelInstanceStyleGroupsAndMappingFetched.combinedMappedStyleGroups
  );
  return {
    styledModels: joinedStyleGroups,
    modelMappingsIsFetched: modelInstanceStyleGroupsAndMappingFetched.modelMappingsIsFetched,
    modelMappingsIsLoading: modelInstanceStyleGroupsAndMappingFetched.modelMappingsIsLoading
  };
};

function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroup[] {
  const modelsRevisionsWithMappedEquipment = useMemo(
    () => getMappedCadModelsOptions(),
    [models, defaultMappedNodeAppearance]
  );
  const { data: mappedEquipmentEdges, isLoading: isFDMEquipmentMappingLoading } =
    useMappedEdgesForRevisions(modelsRevisionsWithMappedEquipment);

  const { data: assetMappingData, isLoading: isAssetMappingLoading } =
    useAssetMappedNodesForRevisions(modelsRevisionsWithMappedEquipment);

  const modelsMappedFdmStyleGroups = useMemo(() => {
    const isFdmMappingUnavailableOrLoading =
      models.length === 0 ||
      mappedEquipmentEdges === undefined ||
      mappedEquipmentEdges.size === 0 ||
      isFDMEquipmentMappingLoading;

    if (isFdmMappingUnavailableOrLoading) {
      return [];
    }

    return modelsRevisionsWithMappedEquipment.map((model) => {
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];
      const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined ? [getMappedStyleGroupFromFdm(fdmData, modelStyle)] : [];
      return { model, styleGroup };
    });
  }, [
    modelsRevisionsWithMappedEquipment,
    mappedEquipmentEdges,
    defaultMappedNodeAppearance,
    isFDMEquipmentMappingLoading
  ]);

  const modelsMappedAssetStyleGroups = useMemo(() => {
    const isAssetMappingUnavailableOrLoading =
      models.length === 0 ||
      assetMappingData === undefined ||
      assetMappingData.length === 0 ||
      isAssetMappingLoading;

    if (isAssetMappingUnavailableOrLoading) {
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
  }, [
    modelsRevisionsWithMappedEquipment,
    assetMappingData,
    defaultMappedNodeAppearance,
    isAssetMappingLoading
  ]);

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...modelsMappedAssetStyleGroups,
        ...modelsMappedFdmStyleGroups
      ]),
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
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>
): ModelStyleGroupWithMappingsFetched {
  const { data: fdmAssetMappings } = useFdmAssetMappings(
    instanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const {
    data: modelAssetMappings,
    isFetched,
    isLoading
  } = useNodesForAssets(
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
      groupStyleGroupByModel(models, [
        ...fdmModelInstanceStyleGroups,
        ...assetMappingInstanceStyleGroups
      ]),
    [fdmModelInstanceStyleGroups, assetMappingInstanceStyleGroups]
  );

  return {
    combinedMappedStyleGroups,
    modelMappingsIsFetched: isFetched,
    modelMappingsIsLoading: isLoading
  };
}

function useAssetMappingInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
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
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
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
        modelsMappedStyleGroups.find((typedModel) => isSameModel(typedModel.model, model))
          ?.styleGroup ?? [];
      const instanceStyleGroups = modelInstanceStyleGroups
        .filter((typedModel) => isSameModel(typedModel.model, model))
        .flatMap((typedModel) => typedModel.styleGroup);
      return {
        model,
        styleGroups: [...mappedStyleGroup, ...instanceStyleGroups]
      };
    });
  }, [models, modelInstanceStyleGroups, modelsMappedStyleGroups]);

  return modelsStyling;
}

function groupStyleGroupByModel(
  models: CadModelOptions[],
  styleGroup: ModelStyleGroup[]
): ModelStyleGroup[] {
  const initialStyleGroups = models.map((model) => ({ model, styleGroup: [] }));
  return styleGroup.reduce<ModelStyleGroup[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSameModel(group.model, currentGroup.model)
    );
    existingGroupWithModel?.styleGroup.push(...currentGroup.styleGroup);
    return accumulatedGroups;
  }, initialStyleGroups);
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
  stylingGroups: AssetStylingGroup[],
  nodeMap: Map<AssetId, Node3D[]>,
  model: CadModelOptions
): ModelStyleGroup {
  const treeIndexSetsWithStyle = stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      group.assetIds
        .map((assetId) => nodeMap.get(assetId))
        .forEach((nodeList) =>
          nodeList
            ?.filter((node): node is Node3D => node !== undefined)
            .forEach((node) => {
              indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
            })
        );

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
