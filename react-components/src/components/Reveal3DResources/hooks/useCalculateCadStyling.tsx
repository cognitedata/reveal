import {
  type CadModelOptions,
  type DefaultResourceStyling,
  type InstanceStylingGroup
} from '../types';
import { NumericRange, type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type Node3D } from '@cognite/sdk';
import { createContext, useContext, useMemo } from 'react';
import { type AssetId, type FdmKey, type CadNodeTreeData } from '../../CacheProvider/types';
import {
  type CadStylingGroup,
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../../CadModelContainer/types';
import { isSameModel } from '../../../utilities/isSameModel';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_QUERY_STALE_TIME } from '../../../utilities/constants';
import { useCadMappingsCache } from '../../CacheProvider/CacheProvider';
import { isDefined } from '../../../utilities/isDefined';
import {
  getInstanceIdsFromReferences,
  getInstanceKeysFromStylingGroup,
  getInstanceReferencesFromStylingGroup
} from '../utils';
import { createModelRevisionKey } from '../../CacheProvider/idAndKeyTranslation';
import { type CadModelMappings } from '../../CacheProvider/cad/CadInstanceMappingsCache';
import { type InstanceReferenceKey } from '../../../utilities/instanceIds';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

type ModelStyleGroupWithMappingsFetched = {
  combinedMappedStyleGroups: ModelStyleGroup[];
  isModelMappingsLoading: boolean;
  isError: boolean;
};

type StyledModelWithMappingsFetched = {
  styledModels: StyledModel[];
  isModelMappingsLoading: boolean;
};

export type StyledModel = {
  model: CadModelOptions;
  styleGroups: CadStylingGroup[];
};

export type UseCalculateCadStylingDependencies = {
  useCadMappingsCache: typeof useCadMappingsCache;
};

export const defaultUseCalculateCadStylingDependencies: UseCalculateCadStylingDependencies = {
  useCadMappingsCache
};

export const UseCalculateCadStylingContext = createContext<UseCalculateCadStylingDependencies>(
  defaultUseCalculateCadStylingDependencies
);

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: InstanceStylingGroup[],
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
  const { useCadMappingsCache } = useContext(UseCalculateCadStylingContext);

  const cadMappingsCache = useCadMappingsCache();

  const {
    data: modelMappingsMap,
    isLoading,
    isError
  } = useQuery<CadModelMappings>({
    queryKey: [
      'reveal',
      'react-components',
      'models-instance-mappings',
      ...models.map(({ modelId, revisionId }) => createModelRevisionKey(modelId, revisionId))
    ],
    queryFn: async () => await cadMappingsCache.getAllModelMappings(models)
  });

  const styleGroupsWithModels = useMemo(() => {
    if (modelMappingsMap === undefined) {
      return [];
    }
    return models
      .map((model) => {
        const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;
        if (modelStyle === undefined) {
          return undefined;
        }

        const instanceToTreeIndexMap = modelMappingsMap.get(
          createModelRevisionKey(model.modelId, model.revisionId)
        );

        if (instanceToTreeIndexMap === undefined) {
          return undefined;
        }

        const styleGroup = getMappedStyleGroupFromInstanceToNodeMap(
          instanceToTreeIndexMap,
          modelStyle
        );
        return { model, styleGroup: [styleGroup] };
      })
      .filter(isDefined);
  }, [models, defaultMappedNodeAppearance, modelMappingsMap]);

  return {
    combinedMappedStyleGroups: styleGroupsWithModels,
    isModelMappingsLoading: isLoading,
    isError
  };
}

function useCalculateInstanceStyling(
  models: CadModelOptions[],
  instanceGroups: InstanceStylingGroup[]
): ModelStyleGroupWithMappingsFetched {
  const instanceReferences = instanceGroups.flatMap(getInstanceReferencesFromStylingGroup);

  const { useCadMappingsCache } = useContext(UseCalculateCadStylingContext);

  const cadCache = useCadMappingsCache();

  const {
    data: modelStyleGroups,
    isLoading: isModelMappingsLoading,
    isError
  } = useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'cad-asset-mappings',
      instanceReferences,
      models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async () => {
      const mappings = await cadCache.getMappingsForModelsAndInstances(
        getInstanceIdsFromReferences(instanceReferences),
        models
      );

      const modelStyleGroups = models
        .map((model) => {
          const modelKey = createModelRevisionKey(model.modelId, model.revisionId);

          const modelMappings = mappings.get(modelKey);

          if (modelMappings === undefined || modelMappings.size === 0) {
            return undefined;
          }

          return {
            model,
            styleGroup: createStyleGroupsFromMappings(instanceGroups, modelMappings)
          };
        })
        .filter(isDefined);

      return modelStyleGroups;
    },
    staleTime: DEFAULT_QUERY_STALE_TIME
  });

  return useMemo(() => {
    return { combinedMappedStyleGroups: modelStyleGroups ?? [], isModelMappingsLoading, isError };
  }, [modelStyleGroups, isModelMappingsLoading, isError]);
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

function extractDefaultStyles(typedModels: CadModelOptions[]): StyledModel[] {
  return typedModels.map((model) => {
    return {
      model,
      styleGroups: []
    };
  });
}
function getMappedStyleGroupFromInstanceToNodeMap(
  instanceToNodeMap: Map<AssetId | FdmKey, CadNodeTreeData[]>,
  style: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  [...instanceToNodeMap.values()].flat().forEach((nodeTreeIndexData) => {
    indexSet.addRange(getNodeSubtreeNumericRange(nodeTreeIndexData));
  });

  return { treeIndexSet: indexSet, style };
}

function createStyleGroupsFromMappings(
  stylingGroups: InstanceStylingGroup[],
  mappings?: Map<InstanceReferenceKey, Node3D[]>
): TreeIndexStylingGroup[] {
  if (mappings === undefined || mappings.size === 0) {
    return [];
  }

  return stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      const style = group.style.cad;
      const instanceKeys = getInstanceKeysFromStylingGroup(group);

      if (style === undefined || instanceKeys.length === 0) {
        return undefined;
      }

      for (const instanceKey of instanceKeys) {
        const nodes = mappings.get(instanceKey);
        if (nodes === undefined || nodes.length === 0) {
          continue;
        }

        for (const node of nodes) {
          indexSet.addRange(getNodeSubtreeNumericRange(node));
        }
      }

      return indexSet.count > 0 ? { treeIndexSet: indexSet, style } : undefined;
    })
    .filter(isDefined);
}

function getNodeSubtreeNumericRange(node: CadNodeTreeData): NumericRange {
  return new NumericRange(node.treeIndex, node.subtreeSize);
}
