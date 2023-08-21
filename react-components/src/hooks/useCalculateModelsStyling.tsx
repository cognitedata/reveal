/*!
 * Copyright 2023 Cognite AS
 */
import {
  type FdmAssetStylingGroup,
  type TypedReveal3DModel
} from '../components/Reveal3DResources/types';
import { type PointCloudModelStyling } from '../components/PointCloudContainer/PointCloudContainer';
import {
  type NodeStylingGroup,
  type CadModelStyling,
  type TreeIndexStylingGroup
} from '../components/CadModelContainer/CadModelContainer';
import { type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type EdgeItem } from '../utilities/FdmSDK';
import { type NodeAppearance } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import { useFdmAssetMappings } from '../components/NodeCacheProvider/NodeCacheProvider';
import { useMemo } from 'react';
import { useMappedEdgesForRevisions } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type FdmEdgeWithNode, type TreeIndex } from '../components/NodeCacheProvider/types';

type ModelStyleGroup = {
  model: TypedReveal3DModel;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

export const useCalculateModelsStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: FdmAssetStylingGroup[]
): Array<PointCloudModelStyling | CadModelStyling> => {
  const modelsMappedStyleGroups = useCalculateMappedStyling(models);
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);
  console.log('Model instance style groups = ', modelInstanceStyleGroups);
  const joinedStyleGroups = useJoinStylingGroups(
    models,
    modelsMappedStyleGroups,
    modelInstanceStyleGroups
  );
  return joinedStyleGroups;
};

function useCalculateMappedStyling(models: TypedReveal3DModel[]): ModelStyleGroup[] {
  const modelsRevisionsWithMappedEquipment = models.filter(
    (model) => model.styling?.mapped !== undefined
  );
  const shouldFetchAllMappedEquipment = modelsRevisionsWithMappedEquipment.length > 0;
  const { data: mappedEquipmentEdges } = useMappedEdgesForRevisions(
    modelsRevisionsWithMappedEquipment,
    shouldFetchAllMappedEquipment
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
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];

      const styleGroup =
        model.styling?.mapped !== undefined
          ? [getMappedStyleGroup(fdmData, model.styling.mapped)]
          : [];
      return { model, styleGroup };
    });
  }, [models, mappedEquipmentEdges]);

  return modelsMappedStyleGroups;
}

function useCalculateInstanceStyling(
  models: TypedReveal3DModel[],
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
  models: TypedReveal3DModel[],
  modelsMappedStyleGroups: ModelStyleGroup[],
  modelInstanceStyleGroups: ModelStyleGroup[]
): Array<PointCloudModelStyling | CadModelStyling> {
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
        defaultStyle: model.styling?.default,
        groups: [...mappedStyleGroup, ...instanceStyleGroups]
      };
    });
  }, [models, modelInstanceStyleGroups, modelsMappedStyleGroups]);

  return modelsStyling;
}

function extractDefaultStyles(
  typedModels: TypedReveal3DModel[]
): Array<PointCloudModelStyling | CadModelStyling> {
  return typedModels.map((model) => {
    return {
      defaultStyle: model.styling?.default
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
  model: TypedReveal3DModel
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  const resourcesStylingGroups = stylingGroups;

  return resourcesStylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodes = resourcesGroup.fdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(uniqueId.externalId))
        .filter((node): node is Node3D => node !== undefined);
      return {
        style: resourcesGroup.style.cad,
        treeIndices: modelMappedNodes.flatMap((n) => getNodeSubtreeIndices(n))
      };
    })
    .filter((group) => group.treeIndices.length > 0);
}

function getNodeSubtreeIndices(node: Node3D): TreeIndex[] {
  return [...Array(node.subtreeSize).keys()].map((i) => i + node.treeIndex);
}

function getModelMappings(
  mappings: ThreeDModelMappings[],
  model: TypedReveal3DModel
): Map<CogniteExternalId, Node3D> {
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
      { modelId: model.modelId, revisionId: model.revisionId, mappings: new Map<string, Node3D>() }
    ).mappings;
}

function mergeMaps(
  targetMap: Map<string, Node3D>,
  addedMap: Map<string, Node3D>
): Map<string, Node3D> {
  addedMap.forEach((value, key) => targetMap.set(key, value));

  return targetMap;
}
