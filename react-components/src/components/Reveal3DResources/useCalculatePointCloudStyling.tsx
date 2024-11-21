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
  isClassicPointCloudModel,
  type ClassicDataSourceType,
  type AddModelOptions
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type AssetStylingGroup,
  type TypedReveal3DModel,
  type CadPointCloudModelWithModelIdRevisionId,
  type FdmAssetStylingGroup
} from './types';
import { useMemo } from 'react';
import { isSameModel } from '../../utilities/isSameModel';
import { usePointCloudAnnotationMappingsForModels } from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { EMPTY_ARRAY } from '../../utilities/constants';
import {
  type PointCloudVolumeWithAsset,
  type PointCloudAnnotationModel
} from '../CacheProvider/types';
import { type PointCloudVolumeStylingGroup } from '../PointCloudContainer/types';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isDefined } from '../../utilities/isDefined';
import { use3dModels } from '../../hooks';
import {
  isAssetMappingStylingGroup,
  isFdmAssetStylingGroup
} from '../../utilities/StylingGroupUtils';

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: PointCloudVolumeStylingGroup[];
};

export type AnnotationModelDataResult = {
  model: PointCloudModelOptions;
  annotationModel: PointCloudAnnotationModel[];
};

export type DMVolumeModelDataResult = {
  model: PointCloudModelOptions;
  pointCloudDMVolumeWithAsset: PointCloudVolumeWithAsset[];
};

type MatchedModel = {
  viewerModel: CognitePointCloudModel<DataSourceType>;
  model: CadPointCloudModelWithModelIdRevisionId;
};

type PointCloudVolumeWithModel = {
  model: PointCloudModelOptions;
  pointCloudVolumes: Array<number | DMInstanceRef>;
  asset?: Array<number | string | DMInstanceRef | undefined>;
};

export const useCalculatePointCloudStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>,
  defaultResourceStyling?: DefaultResourceStyling
): StyledPointCloudModel[] => {
  const pointCloudModelOptions = useMemo(
    () => models.filter((model): model is PointCloudModelOptions => model.type === 'pointcloud'),
    [models]
  );

  const styledPointCloudModels = useCalculateMappedPointCloudStyling(
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
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>
): StyledPointCloudModel[] {
  const { data: pointCloudAnnotationMappings } = usePointCloudAnnotationMappingsForModels(models);

  const annotationMappingInstanceStyleGroups = useAnnotationMappingInstanceStyleGroups(
    pointCloudAnnotationMappings,
    models,
    instanceGroups
  );

  const dmVolumeMappings = usePointCloudVolumesWithModel(models);

  const dmInstanceStyleGroups = useVolumeMappingInstanceStyleGroups(
    dmVolumeMappings,
    models,
    instanceGroups
  );

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...annotationMappingInstanceStyleGroups,
        ...dmInstanceStyleGroups
      ]),
    [annotationMappingInstanceStyleGroups, dmInstanceStyleGroups]
  );

  return combinedMappedStyleGroups;
}

function useAnnotationMappingInstanceStyleGroups(
  annotationMappings: AnnotationModelDataResult[] | undefined,
  models: PointCloudModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (annotationMappings === undefined || annotationMappings.length === 0) {
      return EMPTY_ARRAY;
    }
    return annotationMappings.map((annotationMapping) => {
      return calculateAnnotationMappingModelStyling(
        instanceGroups.filter(isAssetMappingStylingGroup),
        annotationMapping
      );
    });
  }, [annotationMappings, models, instanceGroups]);
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

function useVolumeMappingInstanceStyleGroups(
  dmVolumeMappings: PointCloudVolumeWithModel[],
  models: PointCloudModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup>
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (dmVolumeMappings === undefined || dmVolumeMappings.length === 0) {
      return EMPTY_ARRAY;
    }
    return dmVolumeMappings.map((dmVolumeMapping) => {
      return calculateVolumeMappingModelStyling(
        instanceGroups.filter(isFdmAssetStylingGroup),
        dmVolumeMapping
      );
    });
  }, [dmVolumeMappings, models, instanceGroups]);
}

function calculateVolumeMappingModelStyling(
  instanceGroups: FdmAssetStylingGroup[],
  dmVolumeMapping: PointCloudVolumeWithModel
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => {
      return getDMMappedStyleGroupFromAssetIds(dmVolumeMapping, group);
    })
    .filter((styleGroup): styleGroup is PointCloudVolumeStylingGroup => styleGroup !== undefined);

  return { model: dmVolumeMapping.model, styleGroups };
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

function getDMMappedStyleGroupFromAssetIds(
  dmVolumeMapping: PointCloudVolumeWithModel,
  instanceGroup: FdmAssetStylingGroup
): PointCloudVolumeStylingGroup | undefined {
  const uniqueVolumeRefs = new Set<string>();
  const assetIdsSet = new Set(
    instanceGroup.fdmAssetExternalIds.map((instance) => `${instance.externalId}/${instance.space}`)
  );

  const matchedVolumeRefModels = dmVolumeMapping.pointCloudVolumes
    .filter((pointCloudVolume, index) => {
      if (typeof pointCloudVolume === 'number') {
        return false;
      }
      const assetRef =
        dmVolumeMapping.asset !== undefined
          ? (dmVolumeMapping.asset[index] as DMInstanceRef)
          : undefined;
      const volumeInstanceRef = `${pointCloudVolume.externalId}/${pointCloudVolume.space}`;
      const isAssetIdInMapping =
        assetRef !== undefined && assetIdsSet.has(`${assetRef.externalId}/${assetRef.space}`);
      if (isAssetIdInMapping && !uniqueVolumeRefs.has(volumeInstanceRef)) {
        uniqueVolumeRefs.add(volumeInstanceRef);
        return true;
      }
      return false;
    })
    .filter((volume) => typeof volume !== 'number');

  return matchedVolumeRefModels.length > 0
    ? {
        pointCloudVolumes: matchedVolumeRefModels.map((dmVolumeModel) => {
          return dmVolumeModel;
        }),
        style: instanceGroup.style.pointcloud ?? {}
      }
    : undefined;
}

function useCalculateMappedPointCloudStyling(
  models: PointCloudModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  const pointCloudVolumesWithModel = usePointCloudVolumesWithModel(models);

  const modelsMappedVolumeStyleGroups = useModelsMappedVolumeStyleGroups(
    models,
    pointCloudVolumesWithModel,
    defaultMappedNodeAppearance
  );

  return modelsMappedVolumeStyleGroups;
}

function useModelsWithModelIdAndRevision(
  models: PointCloudModelOptions[],
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>
): CadPointCloudModelWithModelIdRevisionId[] {
  return useMemo(() => {
    return classicModelOptions.map((model, index) => ({
      modelOptions: models[index],
      ...model
    }));
  }, [classicModelOptions, models]);
}

function useMatchedModels(
  viewerModels: Array<CognitePointCloudModel<DataSourceType>>,
  modelsWithModelIdAndRevision: CadPointCloudModelWithModelIdRevisionId[]
): MatchedModel[] {
  return useMemo(() => {
    return viewerModels.flatMap((viewerModel) => {
      if (viewerModel.type !== 'pointcloud') {
        return [];
      }
      const model = viewerModel;
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
  }, [viewerModels, modelsWithModelIdAndRevision]);
}

function usePointCloudVolumesWithModel(
  models: PointCloudModelOptions[]
): PointCloudVolumeWithModel[] {
  const viewerModels = use3dModels();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  const modelsWithModelIdAndRevision = useModelsWithModelIdAndRevision(models, classicModelOptions);

  const pointCloudViewerModels = viewerModels.filter(
    (model): model is CognitePointCloudModel<DataSourceType> => model.type === 'pointcloud'
  );
  const matchedModels = useMatchedModels(pointCloudViewerModels, modelsWithModelIdAndRevision);

  return useMemo(() => {
    if (matchedModels.length === 0 || pointCloudViewerModels.length === 0) {
      return models
        .filter((model): model is PointCloudModelOptions => model.type === 'pointcloud')
        .map((model) => ({
          model,
          pointCloudVolumes: []
        }));
    }
    return matchedModels.map(({ viewerModel, model }) => {
      const pointCloudVolumesWithAsset: Array<{
        pointCloudVolume: number | DMInstanceRef;
        asset: number | string | DMInstanceRef | undefined;
      }> = [];
      viewerModel.stylableObjects.forEach((object) => {
        if (isClassicPointCloudVolume(object)) {
          pointCloudVolumesWithAsset.push({
            pointCloudVolume: object.annotationId,
            asset: object.assetRef?.id ?? object.assetRef?.externalId
          });
        } else if (isDMPointCloudVolume(object)) {
          pointCloudVolumesWithAsset.push({
            pointCloudVolume: object.volumeInstanceRef,
            asset: object.assetRef
          });
        }
      });
      const pointCloudVolumes = pointCloudVolumesWithAsset.map((data) => data.pointCloudVolume);
      const asset = pointCloudVolumesWithAsset.map((data) => data.asset);
      return { model: model.modelOptions as PointCloudModelOptions, pointCloudVolumes, asset };
    });
  }, [matchedModels, pointCloudViewerModels, models]);
}

function useModelsMappedVolumeStyleGroups(
  models: PointCloudModelOptions[],
  pointCloudVolumesWithModel: PointCloudVolumeWithModel[],
  defaultMappedNodeAppearance?: NodeAppearance
): StyledPointCloudModel[] {
  return useMemo(() => {
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
}

function getMappedStyleGroupFromPointCloudVolume(
  pointCloudVolumeData: PointCloudVolumeWithModel[],
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
