/*!
 * Copyright 2023 Cognite AS
 */
import {
  type AddReveal3DModelOptions,
  type AssetStylingGroup,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../components/Reveal3DResources/types';
import {
  NumericRange,
  type NodeAppearance,
  IndexSet,
  DefaultNodeAppearance
} from '@cognite/reveal';
import { type ThreeDModelFdmMappings } from './types';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import {
  type NodeId,
  type FdmEdgeWithNode,
  type AssetId,
  type ModelRevisionAssetNodesResult
} from '../components/CacheProvider/types';
import {
  type AssetMappingCache,
  type AssetMapping
} from '../components/CacheProvider/AssetMappingCache';

import { isSame3dModel } from '../utilities/isSameModel';
import { isAssetMappingStylingGroup, isFdmAssetStylingGroup } from '../utilities/StylingGroupUtils';
import {
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../components/Reveal3DResources/applyCadStyling';
import { type FdmNodeCache } from '../components/CacheProvider/FdmNodeCache';

type ModelStyleGroup = {
  model: AddReveal3DModelOptions;
  styleGroup: CadStyleGroup[];
};

export type CadStyleGroup = NodeStylingGroup | TreeIndexStylingGroup;

export type StyledCadModelAddOptions = {
  addOptions: AddReveal3DModelOptions;
  styleGroups: CadStyleGroup[];
  defaultStyle: NodeAppearance;
};

export async function calculateCadStyling(
  models: AddReveal3DModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
  fdmNodeCache: FdmNodeCache,
  assetMappingCache: AssetMappingCache,
  defaultResourceStyling?: DefaultResourceStyling
): Promise<StyledCadModelAddOptions[]> {
  const modelsMappedStyleGroups =
    defaultResourceStyling?.cad?.mapped !== undefined
      ? await calculateMappedStyling(
          models,
          fdmNodeCache,
          assetMappingCache,
          defaultResourceStyling?.cad?.mapped
        )
      : [];

  const modelInstanceStyleGroups = await calculateInstanceStyling(
    models,
    instanceGroups,
    fdmNodeCache,
    assetMappingCache
  );

  return joinStylingGroups(
    models,
    modelsMappedStyleGroups,
    modelInstanceStyleGroups,
    defaultResourceStyling?.cad?.default
  );
}

async function calculateMappedStyling(
  models: AddReveal3DModelOptions[],
  fdmNodeCache: FdmNodeCache,
  assetMappingCache: AssetMappingCache,
  defaultMappedNodeAppearance: NodeAppearance | undefined
): Promise<ModelStyleGroup[]> {
  const modelsRevisionsWithMappedEquipment = getMappedCadModelsOptions();
  const mappedEquipmentEdges = await fdmNodeCache.getAllMappingExternalIds(
    modelsRevisionsWithMappedEquipment,
    false
  );

  const fetchPromises = modelsRevisionsWithMappedEquipment.map(
    async (model) =>
      await assetMappingCache
        .getAssetMappingsForModel(model.modelId, model.revisionId)
        .then((assetMappings) => ({ model, assetMappings }))
  );

  const assetMappingData = await Promise.all(fetchPromises);

  const modelsMappedFdmStyleGroups = modelsRevisionsWithMappedEquipment.map((model) => {
    const fdmData = mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];
    const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

    const styleGroup =
      modelStyle !== undefined ? [getMappedStyleGroupFromFdm(fdmData, modelStyle)] : [];
    return { model, styleGroup };
  });

  const modelsMappedAssetStyleGroups = assetMappingData.map((assetMappedModel) => {
    const modelStyle = assetMappedModel.model.styling?.mapped ?? defaultMappedNodeAppearance;

    const styleGroup =
      modelStyle !== undefined
        ? [getMappedStyleGroupFromAssetMappings(assetMappedModel.assetMappings, modelStyle)]
        : [];
    return { model: assetMappedModel.model, styleGroup };
  });

  const combinedMappedStyleGroups = groupStyleGroupByModel([
    ...modelsMappedAssetStyleGroups,
    ...modelsMappedFdmStyleGroups
  ]);

  return combinedMappedStyleGroups;

  function getMappedCadModelsOptions(): AddReveal3DModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
}

async function calculateInstanceStyling(
  models: AddReveal3DModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
  fdmNodeCache: FdmNodeCache,
  assetMappingCache: AssetMappingCache
): Promise<ModelStyleGroup[]> {
  if (instanceGroups.length === 0) {
    return [];
  }

  const fdmAssetMappings = await fdmNodeCache.getMappingsForFdmIds(
    instanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const assetIds = instanceGroups
    .filter(isAssetMappingStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.assetIds);

  const modelAndNodeMapPromises = models.map(async (model) => {
    const nodeMap = await assetMappingCache.getNodesForAssetIds(
      model.modelId,
      model.revisionId,
      assetIds
    );
    return { modelId: model.modelId, revisionId: model.revisionId, assetToNodeMap: nodeMap };
  });

  const modelAssetMappings = await Promise.all(modelAndNodeMapPromises);

  const fdmModelInstanceStyleGroups = getFdmInstanceStyleGroups(
    models,
    instanceGroups,
    fdmAssetMappings
  );

  const assetMappingInstanceStyleGroups = getAssetMappingInstanceStyleGroups(
    models,
    instanceGroups,
    modelAssetMappings
  );

  const combinedMappedStyleGroups = groupStyleGroupByModel([
    ...fdmModelInstanceStyleGroups,
    ...assetMappingInstanceStyleGroups
  ]);

  return combinedMappedStyleGroups;
}

function getAssetMappingInstanceStyleGroups(
  models: AddReveal3DModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
  modelAssetMappings: ModelRevisionAssetNodesResult[] | undefined
): ModelStyleGroup[] {
  if (modelAssetMappings === undefined) {
    return [];
  }

  return models.map((model, index) => {
    return calculateAssetMappingCadModelStyling(
      instanceGroups.filter(isAssetMappingStylingGroup),
      modelAssetMappings[index].assetToNodeMap,
      model
    );
  });
}

function getFdmInstanceStyleGroups(
  models: AddReveal3DModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
  fdmAssetMappings: ThreeDModelFdmMappings[] | undefined
): ModelStyleGroup[] {
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
}

function joinStylingGroups(
  models: AddReveal3DModelOptions[],
  modelsMappedStyleGroups: ModelStyleGroup[],
  modelInstanceStyleGroups: ModelStyleGroup[],
  defaultNodeAppearance: NodeAppearance | undefined
): StyledCadModelAddOptions[] {
  if (modelInstanceStyleGroups.length === 0 && modelsMappedStyleGroups.length === 0) {
    return extractDefaultStyles(models, defaultNodeAppearance);
  }
  return models.map((model) => {
    const mappedStyleGroup =
      modelsMappedStyleGroups.find((typedModel) => isSame3dModel(typedModel.model, model))
        ?.styleGroup ?? [];
    const instanceStyleGroups = modelInstanceStyleGroups
      .filter((typedModel) => isSame3dModel(typedModel.model, model))
      .flatMap((typedModel) => typedModel.styleGroup);
    return {
      addOptions: model,
      styleGroups: [...mappedStyleGroup, ...instanceStyleGroups],
      defaultStyle: model.styling?.default ?? defaultNodeAppearance ?? DefaultNodeAppearance.Default
    };
  });
}

function groupStyleGroupByModel(styleGroup: ModelStyleGroup[]): ModelStyleGroup[] {
  return styleGroup.reduce<ModelStyleGroup[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSame3dModel(group.model, currentGroup.model)
    );
    if (existingGroupWithModel !== undefined) {
      existingGroupWithModel.styleGroup.push(...currentGroup.styleGroup);
    } else {
      accumulatedGroups.push({
        model: currentGroup.model,
        styleGroup: [...currentGroup.styleGroup]
      });
    }
    return accumulatedGroups;
  }, []);
}

function extractDefaultStyles(
  typedModels: AddReveal3DModelOptions[],
  defaultNodeAppearance: NodeAppearance | undefined
): StyledCadModelAddOptions[] {
  return typedModels.map((model) => {
    return {
      addOptions: model,
      styleGroups: [],
      defaultStyle: model.styling?.default ?? defaultNodeAppearance ?? DefaultNodeAppearance.Default
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
  model: AddReveal3DModelOptions
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
  model: AddReveal3DModelOptions
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
  model: AddReveal3DModelOptions
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
