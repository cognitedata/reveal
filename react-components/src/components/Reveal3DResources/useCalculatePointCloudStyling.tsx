/*!
 * Copyright 2024 Cognite AS
 */
import {
  type CognitePointCloudModel,
  type DataSourceType,
  isClassicPointCloudVolume,
  isDMPointCloudVolume,
  type DMInstanceRef,
  type NodeAppearance,
  isDMPointCloudModel,
  isClassicPointCloudModel
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type AssetStylingGroup,
  type TypedReveal3DModel,
  type CadPointCloudModelWithModelIdRevisionId
} from './types';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isSameModel } from '../../utilities/isSameModel';
import { usePointCloudAnnotationMappingsForModels } from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { type PointCloudAnnotationModel } from '../CacheProvider/types';
import { type PointCloudVolumeStylingGroup } from '../PointCloudContainer/types';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import { useReveal } from '../RevealCanvas';

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: PointCloudVolumeStylingGroup[];
};

export type AnnotationModelDataResult = {
  model: PointCloudModelOptions;
  annotationModel: PointCloudAnnotationModel[];
};

export const useCalculatePointCloudStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: AssetStylingGroup[],
  defaultResourceStyling?: DefaultResourceStyling
): StyledPointCloudModel[] => {
  const pointCloudModelOptions = useMemo(
    () => models.filter((model): model is PointCloudModelOptions => model.type === 'pointcloud'),
    [models]
  );

  const styledPointCloudModels = useCalculateMappedPointCloudStylingFromReveal(
    pointCloudModelOptions,
    defaultResourceStyling?.pointcloud?.mapped
  );
  const modelInstanceStyleGroups = useCalculateInstanceStyling(
    pointCloudModelOptions,
    instanceGroups
  );

  const combinedStyledPointCloudModels = useMemo(() => {
    return groupStyleGroupByModel(pointCloudModelOptions, [
      ...styledPointCloudModels,
      ...modelInstanceStyleGroups
    ]);
  }, [styledPointCloudModels, modelInstanceStyleGroups, pointCloudModelOptions]);

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
    .filter((styleGroup): styleGroup is PointCloudVolumeStylingGroup => styleGroup !== undefined);

  return { model: annotationMapping.model, styleGroups };
}

function getMappedStyleGroupFromAssetIds(
  annotationMapping: AnnotationModelDataResult,
  instanceGroup: AssetStylingGroup
): PointCloudVolumeStylingGroup | undefined {
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
        pointCloudVolumes: matchedAnnotationModels.map((annotationModel) => annotationModel.id),
        style: instanceGroup.style.pointcloud ?? {}
      }
    : undefined;
}

function useCalculateMappedPointCloudStylingFromReveal(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  const viewer = useReveal();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  const modelsWithModelIdAndRevision: CadPointCloudModelWithModelIdRevisionId[] = useMemo(() => {
    return classicModelOptions.map((model, index) => ({
      modelOptions: models[index],
      ...model
    }));
  }, [classicModelOptions, models]);

  const matchedModels = useMemo(() => {
    return viewer.models.flatMap((viewerModel) => {
      const model = viewerModel as CognitePointCloudModel<DataSourceType>;
      const matchedModel = modelsWithModelIdAndRevision.find((modelData) => {
        if (
          isDMPointCloudModel(model) &&
          'revisionExternalId' in modelData &&
          'revisionSpace' in modelData
        ) {
          return (
            model.modelIdentifier.revisionExternalId === modelData.revisionExternalId &&
            model.modelIdentifier.revisionSpace === modelData.revisionSpace
          );
        } else if (isClassicPointCloudModel(model)) {
          return (
            model.modelIdentifier.modelId === modelData.modelId &&
            model.modelIdentifier.revisionId === modelData.revisionId
          );
        }
        return false;
      });
      return matchedModel !== undefined ? [{ viewerModel, model: matchedModel }] : [];
    });
  }, [modelsWithModelIdAndRevision, viewer.models]);

  const pointCloudVolumesWithModel = useMemo(() => {
    if (matchedModels.length === 0 || viewer.models.length === 0) {
      return models
        .filter((model): model is PointCloudModelOptions => model.type === 'pointcloud')
        .map((model) => ({
          model,
          pointCloudVolumes: []
        }));
    }
    return matchedModels
      .filter(({ model }) => model.modelOptions.type === 'pointcloud')
      .map(({ viewerModel, model }) => {
        const pointCloudVolumes: Array<number | DMInstanceRef> = [];
        (viewerModel as CognitePointCloudModel<DataSourceType>).stylableObjects.forEach(
          (object) => {
            if (isClassicPointCloudVolume(object)) {
              pointCloudVolumes.push(object.annotationId);
            } else if (isDMPointCloudVolume(object)) {
              pointCloudVolumes.push(object.volumeInstanceRef);
            }
          }
        );
        return { model: model.modelOptions as PointCloudModelOptions, pointCloudVolumes };
      });
  }, [matchedModels, viewer.models]);

  const modelsMappedVolumeStyleGroups = useMemo(() => {
    if (models.length === 0 || pointCloudVolumesWithModel.length === 0) {
      return EMPTY_ARRAY;
    }

    return pointCloudVolumesWithModel.map((pointCloudVolumeWithModel) => {
      const modelStyle =
        pointCloudVolumeWithModel.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroups: PointCloudVolumeStylingGroup[] =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromPointCloudVolume([pointCloudVolumeWithModel], modelStyle)]
          : EMPTY_ARRAY;
      return { model: pointCloudVolumeWithModel.model, styleGroups };
    });
  }, [models, pointCloudVolumesWithModel, defaultMappedNodeAppearance]);

  return modelsMappedVolumeStyleGroups;
}

function getMappedStyleGroupFromPointCloudVolume(
  pointCloudVolumeData: Array<{
    model: PointCloudModelOptions;
    pointCloudVolumes: Array<number | DMInstanceRef>;
  }>,
  nodeAppearance: NodeAppearance
): PointCloudVolumeStylingGroup {
  const pointCloudVolumes = pointCloudVolumeData.flatMap((data) => {
    return data.pointCloudVolumes;
  });

  return { pointCloudVolumes, style: nodeAppearance };
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
