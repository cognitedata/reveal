/*!
 * Copyright 2023 Cognite AS
 */
import {
  type FdmAssetStylingGroup,
  type TypedReveal3DModel
} from '../components/Reveal3DResources/types';
import { type PointCloudModelStyling } from '../components/PointCloudContainer/PointCloudContainer';
import { type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type EdgeItem } from '../utilities/FdmSDK';
import { type NodeAppearance } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type CogniteExternalId, type CogniteInternalId } from '@cognite/sdk';
import { useFdmAssetMappings } from './useFdmAssetMappings';
import { useEffect, useMemo } from 'react';
import { useMappedEdgesForRevisions } from '../components/NodeCacheProvider/NodeCacheProvider';
import {
  type CadModelStyling,
  type NodeStylingGroup
} from '../components/CadModelContainer/useApplyCadModelStyling';

type ModelStyleGroup = {
  model: TypedReveal3DModel;
  styleGroup: NodeStylingGroup[];
};

export const useCalculateModelsStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: FdmAssetStylingGroup[]
): Array<PointCloudModelStyling | CadModelStyling> => {
  const modelsMappedStyleGroups = useCalculateMappedStyling(models);
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);
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
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}-${model.revisionId}`) ?? [];

      const styleGroup =
        model.styling?.mapped !== undefined
          ? [
              getMappedStyleGroup(
                fdmData.map((data) => data.edge),
                model.styling.mapped
              )
            ]
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
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  mapped: NodeAppearance
): NodeStylingGroup {
  const nodeIds = edges.map((p) => p.properties.revisionNodeId);
  return { nodeIds, style: mapped };
}

function calculateCadModelStyling(
  stylingGroups: FdmAssetStylingGroup[],
  mappings: ThreeDModelMappings[],
  model: TypedReveal3DModel
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
  model: TypedReveal3DModel
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
