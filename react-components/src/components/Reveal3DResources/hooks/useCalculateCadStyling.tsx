import {
  type ClassicAssetStylingGroup,
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmInstanceStylingGroup
} from '../types';
import { NumericRange, type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type Node3D, type CogniteExternalId } from '@cognite/sdk';
import { useMemo } from 'react';
import { type AssetId, type FdmConnectionWithNode } from '../../CacheProvider/types';
import {
  type CadStylingGroup,
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../../CadModelContainer/types';
import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../../utilities/StylingGroupUtils';
import { isSameModel } from '../../../utilities/isSameModel';
import { useAssetMappedNodesForRevisions, useMappedEdgesForRevisions } from '../../../hooks/cad';
import { type ClassicCadAssetMapping } from '../../CacheProvider/cad/ClassicCadAssetMapping';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_QUERY_STALE_TIME } from '../../../utilities/constants';
import { useCadMappingsCache } from '../../CacheProvider/CacheProvider';
import { isDefined } from '../../../utilities/isDefined';
import { getInstanceKeysFromStylingGroup } from '../utils';
import { createModelRevisionKey } from '../../CacheProvider/idAndKeyTranslation';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

type ModelStyleGroupWithMappingsFetched = {
  combinedMappedStyleGroups: ModelStyleGroup[];
  isModelMappingsLoading: boolean;
};

type StyledModelWithMappingsFetched = {
  styledModels: StyledModel[];
  isModelMappingsLoading: boolean;
};

export type StyledModel = {
  model: CadModelOptions;
  styleGroups: CadStylingGroup[];
};

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: Array<FdmInstanceStylingGroup | ClassicAssetStylingGroup>,
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
    modelsMappedStyleGroups.combinedMappedStyleGroups,
    modelInstanceStyleGroupsAndMappingFetched.combinedMappedStyleGroups
  );

  return {
    styledModels: joinedStyleGroups,
    isModelMappingsLoading:
      modelInstanceStyleGroupsAndMappingFetched.isModelMappingsLoading ||
      modelsMappedStyleGroups.isModelMappingsLoading
  };
};

function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroupWithMappingsFetched {
  const modelsRevisionsWithMappedEquipment = useMemo(
    () => getMappedCadModelsOptions(),
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

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading:
      (!isFDMEquipmentMappingsError &&
        isFDMEquipmentMappingsLoading &&
        !isFDMEquipmentMappingsFetched) ||
      (!isAssetMappingsError && isAssetMappingsLoading && !isAssetMappingsFetched)
  };

  function getMappedCadModelsOptions(): CadModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
}

function useCalculateInstanceStyling(
  models: CadModelOptions[],
  instanceGroups: Array<FdmInstanceStylingGroup | ClassicAssetStylingGroup>
): ModelStyleGroupWithMappingsFetched {
  const dmIdsForInstanceGroups = instanceGroups
    .filter(isFdmAssetStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds);
  const assetIdsFromInstanceGroups = instanceGroups
    .filter(isClassicAssetMappingStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.assetIds);

  const cadCache = useCadMappingsCache();

  const { data: modelStyleGroups, isLoading: isModelMappingsLoading } = useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'cad-asset-mappings',
      dmIdsForInstanceGroups,
      assetIdsFromInstanceGroups,
      models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async () => {
      const mappings = await cadCache.getMappingsForModelsAndInstances(
        [...dmIdsForInstanceGroups, ...assetIdsFromInstanceGroups.map((id) => ({ id }))],
        models
      );

      const modelStyleGroups = models
        .map((model) => {
          const modelKey = createModelRevisionKey(model.modelId, model.revisionId);
          const modelMappings = mappings.get(modelKey);
          if (modelMappings === undefined) {
            return undefined;
          }
          return calculateInstanceCadModelStyling(model, instanceGroups, modelMappings);
        })
        .filter(isDefined);

      return modelStyleGroups;
    },
    staleTime: DEFAULT_QUERY_STALE_TIME
  });

  return useMemo(() => {
    return { combinedMappedStyleGroups: modelStyleGroups ?? [], isModelMappingsLoading };
  }, [modelStyleGroups]);
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

      if (model.styling?.nodeGroups !== undefined) {
        instanceStyleGroups.push(...model.styling.nodeGroups);
      }

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
  edges: FdmConnectionWithNode[],
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
  assetMappings: ClassicCadAssetMapping[],
  nodeAppearance: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  assetMappings.forEach((assetMapping) => {
    const range = new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize);
    indexSet.addRange(range);
  });

  return { treeIndexSet: indexSet, style: nodeAppearance };
}

function calculateInstanceCadModelStyling(
  model: CadModelOptions,
  stylingGroups: Array<ClassicAssetStylingGroup | FdmInstanceStylingGroup>,
  mappings: Map<AssetId | CogniteExternalId, Node3D[]>
): ModelStyleGroup {
  const treeIndexSetsWithStyle = stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      getInstanceKeysFromStylingGroup(group).forEach((instanceKey) => {
        const node3dList = mappings.get(instanceKey);
        node3dList?.forEach((node) => {
          indexSet.addRange(getNodeSubtreeNumericRange(node));
        });
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
