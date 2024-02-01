/*!
 * Copyright 2024 Cognite AS
 */
import { type NodeAppearance } from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type PointCloudAnnotationStylingGroup
} from '../components/Reveal3DResources/types';
import { useMemo } from 'react';
import { type AnnotationIdStylingGroup } from '../components/PointCloudContainer/useApplyPointCloudStyling';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type AnnotationFilterProps, type CogniteClient } from '@cognite/sdk';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { isSamePointCloudModel } from '../utilities/isSameModel';

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: AnnotationIdStylingGroup[];
};

export const useCalculatePointCloudStyling = (
  models: PointCloudModelOptions[],
  instanceGroups: PointCloudAnnotationStylingGroup[],
  defaultResourceStyling?: DefaultResourceStyling
): StyledPointCloudModel[] => {
  const styledPointCloudModels = useCalculateMappedPointCloudStyling(
    models,
    defaultResourceStyling?.pointcloud?.mapped
  );
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);

  const combinedStyledPointCloudModels = useMemo(
    () => groupStyleGroupByModel([...styledPointCloudModels, ...modelInstanceStyleGroups]),
    [styledPointCloudModels, modelInstanceStyleGroups]
  );
  return combinedStyledPointCloudModels;
};

function useCalculateInstanceStyling(
  models: PointCloudModelOptions[],
  instanceGroups: PointCloudAnnotationStylingGroup[]
): StyledPointCloudModel[] {
  return useMemo(() => {
    return models.map((model) => {
      return calculateObjectCollectionMappingModelStyling(instanceGroups, model);
    });
  }, [models, instanceGroups]);
}

function calculateObjectCollectionMappingModelStyling(
  instanceGroups: PointCloudAnnotationStylingGroup[],
  model: PointCloudModelOptions
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .filter((group) => group.annotationIds !== undefined && group.annotationIds.length > 0)
    .map((group) => {
      return {
        annotationIds: group.annotationIds,
        style: group.style.pointcloud
      };
    });

  return { model, styleGroups };
}

function useCalculateMappedPointCloudStyling(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  const modelsWithMappedCollection = useMemo(() => getMappedPointCloudModelsOptions(), [models]);

  const { data: pointCloudAnnotationData } = usePointCloudAnnotationIdsForRevisions(
    modelsWithMappedCollection
  );

  const modelsMappedObjectCollectionStyleGroups = useMemo(() => {
    if (
      models.length === 0 ||
      pointCloudAnnotationData === undefined ||
      pointCloudAnnotationData.length === 0
    ) {
      return [];
    }

    return pointCloudAnnotationData.map((pointCloudAnnotationCollection) => {
      const modelStyle =
        pointCloudAnnotationCollection.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroups: AnnotationIdStylingGroup[] =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAnnotationIds([pointCloudAnnotationCollection], modelStyle)]
          : [];
      return { model: pointCloudAnnotationCollection.model, styleGroups };
    });
  }, [modelsWithMappedCollection, pointCloudAnnotationData, defaultMappedNodeAppearance]);

  return modelsMappedObjectCollectionStyleGroups;

  function getMappedPointCloudModelsOptions(): PointCloudModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
}

function usePointCloudAnnotationIdsForRevisions(models: PointCloudModelOptions[]): UseQueryResult<
  Array<{
    model: PointCloudModelOptions;
    annotationIds: number[];
  }>
> {
  const sdk = useSDK();
  return useQuery(
    [
      'reveal',
      'react-components',
      'models-pointcloud-object-collections',
      ...models.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    async () => {
      const fetchData = models.flatMap(async (model) => {
        const annotationIds = await getPointCloudAnnotationIds(model.modelId, sdk);
        return { model, annotationIds };
      });
      const results = await Promise.all(fetchData);
      return results;
    },
    { staleTime: Infinity, enabled: models.length > 0 }
  );
}

async function getPointCloudAnnotationIds(modelId: number, sdk: CogniteClient): Promise<number[]> {
  const filter: AnnotationFilterProps = {
    annotatedResourceIds: [{ id: modelId }],
    annotatedResourceType: 'threedmodel',
    annotationType: 'pointcloud.BoundingVolume'
  };
  const annotations = await sdk.annotations
    .list({
      filter,
      limit: 1000
    })
    .autoPagingToArray({ limit: Infinity });
  return annotations.flatMap((annotation) => annotation.id);
}

function getMappedStyleGroupFromAnnotationIds(
  annotationData: Array<{
    model: PointCloudModelOptions;
    annotationIds: number[];
  }>,
  nodeAppearance: NodeAppearance
): AnnotationIdStylingGroup {
  const annotationIds = annotationData.flatMap((data) => {
    return data.annotationIds;
  });

  return { annotationIds, style: nodeAppearance };
}

function groupStyleGroupByModel(styleGroup: StyledPointCloudModel[]): StyledPointCloudModel[] {
  return styleGroup.reduce<StyledPointCloudModel[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSamePointCloudModel(group.model, currentGroup.model)
    );
    if (existingGroupWithModel !== undefined) {
      existingGroupWithModel.styleGroups.push(...currentGroup.styleGroups);
    } else {
      accumulatedGroups.push({
        model: currentGroup.model,
        styleGroups: [...currentGroup.styleGroups]
      });
    }
    return accumulatedGroups;
  }, []);
}
