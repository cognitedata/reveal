/*!
 * Copyright 2023 Cognite AS
 */
import { type FdmAssetStylingGroup } from '../components/Reveal3DResources/Reveal3DResources';
import { type TypedReveal3DModel } from '../components/Reveal3DResources/types';
import { type PointCloudModelStyling } from '../components/PointCloudContainer/PointCloudContainer';
import {
  type NodeStylingGroup,
  type CadModelStyling
} from '../components/CadModelContainer/CadModelContainer';
import { useMappedEquipmentByRevisionList } from './useMappedEquipmentBy3DModelsList';
import { type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type EdgeItem } from '../utilities/FdmSDK';
import { type NodeAppearance } from '@cognite/reveal';
import { type ThreeDModelMappings } from './types';
import { type CogniteExternalId, type CogniteInternalId } from '@cognite/sdk';
import { useFdmAssetMappings } from './useFdmAssetMappings';
import { useEffect } from 'react';

export const useCalculateModelsStyling2 = (
  models: TypedReveal3DModel[],
  instanceGroups: FdmAssetStylingGroup[]
): Array<PointCloudModelStyling | CadModelStyling> => {
  const modelsRevisionsWithMappedEquipment = models.filter((p) => p.styling?.mapped !== undefined);
  const shouldFetchAllMappedEquipment = modelsRevisionsWithMappedEquipment.length > 0;
  const { data } = useMappedEquipmentByRevisionList(
    modelsRevisionsWithMappedEquipment,
    shouldFetchAllMappedEquipment
  );

  const {
    data: fdmAssetMappingsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useFdmAssetMappings(
    instanceGroups.flatMap((p) => p.fdmAssetExternalIds),
    models
  );

  useEffect(() => {
    if (hasNextPage !== undefined && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  if (data === undefined && fdmAssetMappingsData?.pages === undefined) {
    return extractDefaultStyles(models);
  }
  const fdmAssetMappings = fdmAssetMappingsData?.pages.flatMap((page) => page.items);
  return models.map((p) => {
    const edges = data?.get(`${p.modelId}-${p.revisionId}`) ?? [];

    const mappedStyleGroup =
      p.styling?.mapped !== undefined ? [getMappedStyleGroup(edges, p.styling.mapped)] : [];

    const instanceStyleGroups =
      fdmAssetMappings !== undefined
        ? calculateCadModelStyling(instanceGroups, fdmAssetMappings, p)
        : [];

    const groups = mappedStyleGroup.concat(instanceStyleGroups);

    return {
      defaultStyle: p.styling?.default,
      groups
    };
  });
};

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
      (acc, mapping) => {
        // reduce is added to avoid duplicate models from several pages.
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
