/*!
 * Copyright 2024 Cognite AS
 */
import { type NodeAppearance } from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type AssetStylingGroup
} from './types';
import { useMemo } from 'react';
import { type AnnotationIdStylingGroup } from '../PointCloudContainer/useApplyPointCloudStyling';
import { useQuery } from '@tanstack/react-query';
import { isSameModel } from '../../utilities/isSameModel';
import {
  usePointCloudAnnotationMappingsForModels,
  usePointCloudAnnotationIdsForModels
} from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type PointCloudAnnotationModel } from '../CacheProvider/types';

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: AnnotationIdStylingGroup[];
};

export type AnnotationModelDataResult = {
  model: PointCloudModelOptions;
  annotationModel: PointCloudAnnotationModel[];
};

export const useCalculatePointCloudStyling = (
  models: PointCloudModelOptions[],
  instanceGroups: AssetStylingGroup[],
  defaultResourceStyling?: DefaultResourceStyling
): StyledPointCloudModel[] => {
  const styledPointCloudModels = useCalculateMappedPointCloudStyling(
    models,
    defaultResourceStyling?.pointcloud?.mapped
  );
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);

  const combinedStyledPointCloudModels = useMemo(() => {
    return groupStyleGroupByModel(models, [...styledPointCloudModels, ...modelInstanceStyleGroups]);
  }, [styledPointCloudModels, modelInstanceStyleGroups]);
  return combinedStyledPointCloudModels;
};

function useCalculateInstanceStyling(
  models: PointCloudModelOptions[],
  instanceGroups: AssetStylingGroup[]
): StyledPointCloudModel[] {
  const { data: pointCloudAnnotationMappings, isLoading } =
    usePointCloudAnnotationMappingsForModels(models);

  const { data: styledModels } = useQuery({
    queryKey: ['styledModels', pointCloudAnnotationMappings, instanceGroups, models],
    queryFn: () =>
      pointCloudAnnotationMappings?.map((annotationMappings) => {
        return calculateAnnotationMappingModelStyling(instanceGroups, annotationMappings);
      }) ?? EMPTY_ARRAY,
    enabled: !isLoading
  });

  return styledModels ?? EMPTY_ARRAY;
}

function calculateAnnotationMappingModelStyling(
  instanceGroups: AssetStylingGroup[],
  annotationMapping: AnnotationModelDataResult
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => {
      return getMappedStyleGroupFromAssetIds(annotationMapping, group);
    })
    .filter((styleGroup): styleGroup is AnnotationIdStylingGroup => styleGroup !== undefined);

  return { model: annotationMapping.model, styleGroups };
}

function getMappedStyleGroupFromAssetIds(
  annotationMapping: AnnotationModelDataResult,
  instanceGroup: AssetStylingGroup
): AnnotationIdStylingGroup | undefined {
  const uniqueAnnotationIds = new Set<number>();
  const assetIdsSet = new Set(instanceGroup.assetIds.map((id) => id));

  const matchedAnnotationModels = annotationMapping.annotationModel.filter((annotation) => {
    const assetRef = annotation.data.assetRef;
    const isAssetIdInMapping = assetIdsSet.has(assetRef?.id ?? Number(assetRef?.externalId));
    if (isAssetIdInMapping && !uniqueAnnotationIds.has(annotation.id)) {
      uniqueAnnotationIds.add(annotation.id);
      return true;
    }
    return false;
  });

  return matchedAnnotationModels.length > 0
    ? {
        annotationIds: matchedAnnotationModels.map((annotationModel) => annotationModel.id),
        style: instanceGroup.style.pointcloud ?? {}
      }
    : undefined;
}

function useCalculateMappedPointCloudStyling(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  const modelsWithStyledMapped = useMemo(
    () => getMappedPointCloudModelsOptions(),
    [models, defaultMappedNodeAppearance]
  );

  const { data: pointCloudStyledModelAnnotationIds } =
    usePointCloudAnnotationIdsForModels(modelsWithStyledMapped);

  const modelsMappedAnnotationIdStyleGroups = useMemo(() => {
    if (
      models.length === 0 ||
      pointCloudStyledModelAnnotationIds === undefined ||
      pointCloudStyledModelAnnotationIds.length === 0
    ) {
      return EMPTY_ARRAY;
    }

    return pointCloudStyledModelAnnotationIds.map((pointCloudAnnotationCollection) => {
      const modelStyle =
        pointCloudAnnotationCollection.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroups: AnnotationIdStylingGroup[] =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAnnotationIds([pointCloudAnnotationCollection], modelStyle)]
          : EMPTY_ARRAY;
      return { model: pointCloudAnnotationCollection.model, styleGroups };
    });
  }, [modelsWithStyledMapped, pointCloudStyledModelAnnotationIds, defaultMappedNodeAppearance]);

  return modelsMappedAnnotationIdStyleGroups;

  function getMappedPointCloudModelsOptions(): PointCloudModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
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

function groupStyleGroupByModel(
  models: PointCloudModelOptions[],
  styleGroup: StyledPointCloudModel[]
): StyledPointCloudModel[] {
  const initialStyleGroups = models.map((model) => ({ model, styleGroups: [] }));

  return styleGroup.reduce<StyledPointCloudModel[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSameModel(group.model, currentGroup.model)
    );
    existingGroupWithModel?.styleGroups.push(...currentGroup.styleGroups);
    return accumulatedGroups;
  }, initialStyleGroups);
}
