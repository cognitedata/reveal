/*!
 * Copyright 2024 Cognite AS
 */
import {
  DefaultPointCloudAppearance,
  PointCloudAppearance,
  type NodeAppearance
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type AssetStylingGroup
} from '../components/Reveal3DResources/types';
import { useMemo } from 'react';
import { type AnnotationIdStylingGroup } from '../components/PointCloudContainer/useApplyPointCloudStyling';
import { useQuery } from '@tanstack/react-query';
import { isSame3dModel } from '../utilities/isSameModel';
import {
  usePointCloudAnnotationMappingsForModels,
  usePointCloudAnnotationIdsForModels
} from '../components/CacheProvider/PointCloudAnnotationCacheProvider';
import { EMPTY_ARRAY } from '../utilities/constants';
import { type PointCloudAnnotationModel } from '../components/CacheProvider/types';

export type StyledPointCloudModelAddOptions = {
  addOptions: PointCloudModelOptions;
  styleGroups: AnnotationIdStylingGroup[];
  defaultStyle: PointCloudAppearance;
};

type PointCloudAddOptionsWithStyleGroups = {
  addOptions: PointCloudModelOptions;
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
): StyledPointCloudModelAddOptions[] => {
  const styledPointCloudModels = useCalculateMappedPointCloudStyling(
    models,
    defaultResourceStyling?.pointcloud?.mapped
  );
  const modelInstanceStyleGroups = useCalculateInstanceStyling(models, instanceGroups);

  const combinedStyledPointCloudModels = useMemo(() => {
    return groupStyleGroupByModel(
      [...styledPointCloudModels, ...modelInstanceStyleGroups],
      defaultResourceStyling?.pointcloud?.default
    );
  }, [styledPointCloudModels, modelInstanceStyleGroups]);
  return combinedStyledPointCloudModels;
};

function useCalculateInstanceStyling(
  models: PointCloudModelOptions[],
  instanceGroups: AssetStylingGroup[]
): PointCloudAddOptionsWithStyleGroups[] {
  const { data: pointCloudAnnotationMappings, isLoading } =
    usePointCloudAnnotationMappingsForModels(models);

  const { data: styledModels } = useQuery(
    ['styledModels', pointCloudAnnotationMappings, instanceGroups, models],
    () =>
      pointCloudAnnotationMappings?.map((annotationMappings) => {
        return calculateAnnotationMappingModelStyling(instanceGroups, annotationMappings);
      }) ?? EMPTY_ARRAY,
    {
      enabled: !isLoading
    }
  );

  return styledModels ?? EMPTY_ARRAY;
}

function calculateAnnotationMappingModelStyling(
  instanceGroups: AssetStylingGroup[],
  annotationMapping: AnnotationModelDataResult
): PointCloudAddOptionsWithStyleGroups {
  const styleGroups = instanceGroups
    .map((group) => {
      return getMappedStyleGroupFromAssetIds(annotationMapping, group);
    })
    .filter((styleGroup): styleGroup is AnnotationIdStylingGroup => styleGroup !== undefined);

  return { addOptions: annotationMapping.model, styleGroups };
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
): PointCloudAddOptionsWithStyleGroups[] {
  const modelsWithStyledMapped = useMemo(() => getMappedPointCloudModelsOptions(), [models]);

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
      return { addOptions: pointCloudAnnotationCollection.model, styleGroups };
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
  styleGroup: PointCloudAddOptionsWithStyleGroups[],
  defaultPointCloudAppearance: PointCloudAppearance | undefined
): StyledPointCloudModelAddOptions[] {
  return styleGroup.reduce<StyledPointCloudModelAddOptions[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSame3dModel(group.addOptions, currentGroup.addOptions)
    );
    if (existingGroupWithModel !== undefined) {
      existingGroupWithModel.styleGroups.push(...currentGroup.styleGroups);
    } else {
      accumulatedGroups.push({
        addOptions: currentGroup.addOptions,
        styleGroups: [...currentGroup.styleGroups],
        defaultStyle:
          currentGroup.addOptions.styling?.default ??
          defaultPointCloudAppearance ??
          DefaultPointCloudAppearance
      });
    }
    return accumulatedGroups;
  }, []);
}
