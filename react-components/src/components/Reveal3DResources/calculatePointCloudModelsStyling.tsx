/*!
 * Copyright 2024 Cognite AS
 */
import {
  DefaultPointCloudAppearance,
  type PointCloudAppearance,
  type NodeAppearance
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type AssetStylingGroup,
  type StyledPointCloudModelAddOptions
} from './types';
import { isSame3dModelOptions } from '../../utilities/isSameModel';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type AnnotationId } from '../CacheProvider/types';
import { type PointCloudAnnotationCache } from '../CacheProvider/PointCloudAnnotationCache';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationModelDataResult } from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { uniqBy } from 'lodash';

export type PointCloudAnnotationIdStylingGroup = {
  annotationIds: number[];
  style: PointCloudAppearance;
};

type PointCloudAddOptionsWithStyleGroups = {
  addOptions: PointCloudModelOptions;
  styleGroups: PointCloudAnnotationIdStylingGroup[];
};

export const calculatePointCloudStyling = async (
  models: PointCloudModelOptions[],
  instanceGroups: AssetStylingGroup[],
  defaultResourceStyling: DefaultResourceStyling | undefined,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<StyledPointCloudModelAddOptions[]> => {
  const styledPointCloudModels = await calculateMappedPointCloudStyling(
    models,
    defaultResourceStyling?.pointcloud?.mapped,
    pointCloudAnnotationCache
  );
  const modelInstanceStyleGroups = await calculateInstanceStyling(
    models,
    instanceGroups,
    pointCloudAnnotationCache
  );

  const combinedStyledPointCloudModels = groupStyleGroupByModel(
    [...styledPointCloudModels, ...modelInstanceStyleGroups],
    defaultResourceStyling?.pointcloud?.default
  );
  return combinedStyledPointCloudModels;
};

async function calculateInstanceStyling(
  models: PointCloudModelOptions[],
  instanceGroups: AssetStylingGroup[],
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<PointCloudAddOptionsWithStyleGroups[]> {
  const pointCloudAnnotationMappings = await getPointCloudAnnotationMappingsForModels(
    models,
    pointCloudAnnotationCache
  );

  const styledModels = pointCloudAnnotationMappings?.map((annotationMappings) => {
    return calculateAnnotationMappingModelStyling(instanceGroups, annotationMappings);
  });

  return styledModels;
}

function calculateAnnotationMappingModelStyling(
  instanceGroups: AssetStylingGroup[],
  annotationMapping: AnnotationModelDataResult
): PointCloudAddOptionsWithStyleGroups {
  const styleGroups = instanceGroups
    .map((group) => {
      return getMappedStyleGroupFromAssetIds(annotationMapping, group);
    })
    .filter(isDefined);

  return { addOptions: annotationMapping.model, styleGroups };
}

function getMappedStyleGroupFromAssetIds(
  annotationMapping: AnnotationModelDataResult,
  instanceGroup: AssetStylingGroup
): PointCloudAnnotationIdStylingGroup | undefined {
  const assetIdsSet = new Set(instanceGroup.assetIds.map((id) => id));

  const annotationModelsWithAssetId = annotationMapping.annotationModels.filter((annotation) => {
    const assetId = annotation.data.assetRef?.id;
    return assetId !== undefined && assetIdsSet.has(assetId);
  });

  const uniqueAnnotationModels = uniqBy(annotationModelsWithAssetId, (annotation) => annotation.id);

  return uniqueAnnotationModels.length > 0
    ? {
        annotationIds: uniqueAnnotationModels.map((annotationModel) => annotationModel.id),
        style: instanceGroup.style.pointcloud ?? {}
      }
    : undefined;
}

async function calculateMappedPointCloudStyling(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance: NodeAppearance | undefined,
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<PointCloudAddOptionsWithStyleGroups[]> {
  const modelsWithStyledMapped = getMappedPointCloudModelsOptions();

  const pointCloudStyledModelAnnotationIds = await getPointCloudAnnotationIdsForModels(
    modelsWithStyledMapped,
    pointCloudAnnotationCache
  );

  const modelsMappedAnnotationIdStyleGroups = pointCloudStyledModelAnnotationIds.map(
    (pointCloudAnnotationCollection) => {
      const modelStyle =
        pointCloudAnnotationCollection.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroups: PointCloudAnnotationIdStylingGroup[] =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAnnotationIds([pointCloudAnnotationCollection], modelStyle)]
          : EMPTY_ARRAY;
      return { addOptions: pointCloudAnnotationCollection.model, styleGroups };
    }
  );

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
): PointCloudAnnotationIdStylingGroup {
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
    const defaultStyle =
      currentGroup.addOptions.styling?.default ??
      defaultPointCloudAppearance ??
      DefaultPointCloudAppearance;

    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSame3dModelOptions(group.addOptions, currentGroup.addOptions)
    );
    if (existingGroupWithModel !== undefined) {
      existingGroupWithModel.styleGroups.push(...currentGroup.styleGroups);
    } else {
      accumulatedGroups.push({
        addOptions: currentGroup.addOptions,
        styleGroups: [...currentGroup.styleGroups],
        defaultStyle
      });
    }
    return accumulatedGroups;
  }, []);
}

async function getPointCloudAnnotationIdsForModels(
  models: PointCloudModelOptions[],
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<
  Array<{
    model: PointCloudModelOptions;
    annotationIds: AnnotationId[];
  }>
> {
  return await Promise.all(
    models.map(async (model) => {
      const annotationModel = await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
        model.modelId,
        model.revisionId
      );
      const annotationIds = annotationModel.map((annotation) => {
        return annotation.id;
      });
      return { model, annotationIds };
    })
  );
}

async function getPointCloudAnnotationMappingsForModels(
  models: PointCloudModelOptions[],
  pointCloudAnnotationCache: PointCloudAnnotationCache
): Promise<AnnotationModelDataResult[]> {
  return await Promise.all(
    models.map(async (model) => {
      const annotationModels = await pointCloudAnnotationCache.getPointCloudAnnotationsForModel(
        model.modelId,
        model.revisionId
      );
      return {
        model,
        annotationModels
      };
    })
  );
}
