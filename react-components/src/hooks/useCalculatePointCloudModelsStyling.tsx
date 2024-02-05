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
import {
  type AnnotationsBoundingVolume,
  type AnnotationFilterProps,
  type CogniteClient,
  type AnnotationModel
} from '@cognite/sdk';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { isSamePointCloudModel } from '../utilities/isSameModel';
import { usePointCloudAnnotationMappingsForModels } from '../components/NodeCacheProvider/PointCloudAnnotationCacheProvider';
import { chunk, uniq } from 'lodash';

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: AnnotationIdStylingGroup[];
};

export type AnnotationModelDataResult = {
  model: PointCloudModelOptions;
  annotationModel: AnnotationModel[];
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
  const { data: pointCloudAnnotationMappings, isLoading } =
    usePointCloudAnnotationMappingsForModels(models);

  const { data: styledModels } = useQuery(
    ['styledModels', pointCloudAnnotationMappings, instanceGroups, models, !isLoading],
    () =>
      pointCloudAnnotationMappings?.map((annotationMappings) => {
        return calculateAnnotationMappingModelStyling(instanceGroups, annotationMappings);
      }) ?? [],
    {
      enabled: !isLoading
    }
  );

  return styledModels ?? [];
}

function calculateAnnotationMappingModelStyling(
  instanceGroups: PointCloudAnnotationStylingGroup[],
  annotationMapping: AnnotationModelDataResult
): StyledPointCloudModel {
  const instanceGroup = instanceGroups.filter((group) => group.assetId !== undefined);

  const styleGroups = instanceGroup
    .map((group) => {
      return getMappedStyleGroupFromAssetIds(annotationMapping, group);
    })
    .filter((group): group is AnnotationIdStylingGroup => group !== undefined);

  return { model: annotationMapping.model, styleGroups };
}

function getMappedStyleGroupFromAssetIds(
  annotationMapping: AnnotationModelDataResult,
  instanceGroup: PointCloudAnnotationStylingGroup
): AnnotationIdStylingGroup | undefined {
  const uniqueAnnotationIds = new Set<number>();
  const matchedAnnotationModels = annotationMapping.annotationModel.filter((annotation) => {
    const assetRef = (annotation.data as AnnotationsBoundingVolume).assetRef;
    const isAssetIdInMapping =
      instanceGroup.assetId === assetRef?.id ||
      instanceGroup.assetId.toString() === assetRef?.externalId;
    if (isAssetIdInMapping && !uniqueAnnotationIds.has(annotation.id)) {
      uniqueAnnotationIds.add(annotation.id);
      return true;
    }
    return false;
  });

  return matchedAnnotationModels.length > 0
    ? {
        annotationIds: matchedAnnotationModels.map((annotationModel) => annotationModel.id),
        style: instanceGroup.style.pointcloud
      }
    : undefined;
}

function useCalculateMappedPointCloudStyling(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  const modelsWithStyledMapped = useMemo(() => getMappedPointCloudModelsOptions(), [models]);

  const { data: pointCloudStyledModelAnnotationIds } =
    usePointCloudAnnotationIdsForRevisions(modelsWithStyledMapped);

  const modelsMappedAnnotationIdStyleGroups = useMemo(() => {
    if (
      models.length === 0 ||
      pointCloudStyledModelAnnotationIds === undefined ||
      pointCloudStyledModelAnnotationIds.length === 0
    ) {
      return [];
    }

    return pointCloudStyledModelAnnotationIds.map((pointCloudAnnotationCollection) => {
      const modelStyle =
        pointCloudAnnotationCollection.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroups: AnnotationIdStylingGroup[] =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAnnotationIds([pointCloudAnnotationCollection], modelStyle)]
          : [];
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
      'models-pointcloud-annotations',
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
  const mappedAnnotationIds = await getPointCloudAnnotationId(annotations, sdk);

  return mappedAnnotationIds;
}

async function getPointCloudAnnotationId(
  pointCloudAnnotations: AnnotationModel[],
  sdk: CogniteClient
): Promise<number[]> {
  const annotationToAssetIdArray = pointCloudAnnotations
    .map((annotation) => {
      const assetIdOrExternalId: string | number =
        (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
        (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId ??
        '';
      return assetIdOrExternalId !== ''
        ? { assetIdOrExternalId, annotationId: annotation.id }
        : null;
    })
    .filter(
      (item): item is { assetIdOrExternalId: string | number; annotationId: number } =>
        item !== null
    );

  const uniqueAssetIdsOrExternalIds = uniq(
    annotationToAssetIdArray.map((item) => item.assetIdOrExternalId)
  );

  const assetsResult = await Promise.all(
    chunk(uniqueAssetIdsOrExternalIds, 1000).map(async (uniqueAssetsChunk) => {
      const retrievedAssets = await sdk.assets.retrieve(
        uniqueAssetsChunk.map((assetIdOrExternalId) => {
          if (typeof assetIdOrExternalId === 'number') {
            return { id: assetIdOrExternalId };
          } else {
            return { externalId: assetIdOrExternalId };
          }
        }),
        { ignoreUnknownIds: true }
      );
      return retrievedAssets;
    })
  );

  const assets = assetsResult.flat();

  const annotationIds = assets
    .map((asset) => {
      const assetIdOrExternalId = asset.id ?? asset.externalId;
      const annotationToAssetIdItem = annotationToAssetIdArray.find(
        (item) => item.assetIdOrExternalId === assetIdOrExternalId
      );
      return annotationToAssetIdItem?.annotationId;
    })
    .filter((annotationId): annotationId is number => annotationId !== undefined);

  return annotationIds;
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
