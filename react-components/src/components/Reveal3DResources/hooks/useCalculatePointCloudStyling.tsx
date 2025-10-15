import {
  type CognitePointCloudModel,
  type DataSourceType,
  isClassicPointCloudVolume,
  isDMPointCloudVolume,
  type DMInstanceRef,
  type NodeAppearance
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type ClassicAssetStylingGroup,
  type TypedReveal3DModel,
  type FdmInstanceStylingGroup,
  type AnnotationModelDataResult,
  type StyledPointCloudModel,
  InstanceStylingGroup
} from '../types';
import { useMemo } from 'react';
import { isSameModel } from '../../../utilities/isSameModel';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { type PointCloudVolumeStylingGroup } from '../../PointCloudContainer/types';
import { useModelIdRevisionIdFromModelOptions } from '../../../hooks/useModelIdRevisionIdFromModelOptions';
import { use3dModels } from '../../../hooks/use3dModels';
import { isFdmAssetStylingGroup } from '../../../utilities/StylingGroupUtils';
import { useMatchedPointCloudModels } from './useMatchedPointCloudModels';
import { createFdmKey } from '../../CacheProvider/idAndKeyTranslation';
import { usePointCloudAnnotationMappingsForModels } from '../../../hooks/pointClouds';
import { isDefined } from '../../../utilities/isDefined';
import { createInstanceReferenceKey, InstanceReference } from '../../../utilities/instanceIds';
import { getInstanceKeysFromStylingGroup } from '../utils';
import {
  getInstanceReferencesFromPointCloudAnnotation,
  getInstanceReferencesFromPointCloudVolume,
  getVolumeAnnotationId
} from '../../CacheProvider/utils';
import { PointCloudVolumeId } from '../../CacheProvider/types';

type PointCloudVolumeWithModel = {
  model: PointCloudModelOptions;
  pointCloudVolumes: Array<PointCloudVolumeId>;
  assets: Array<InstanceReference>;
};

export const useCalculatePointCloudStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: Array<InstanceStylingGroup>,
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
  instanceGroups: Array<FdmInstanceStylingGroup | ClassicAssetStylingGroup>
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
  instanceGroups: Array<InstanceStylingGroup>
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (annotationMappings === undefined || annotationMappings.length === 0) {
      return EMPTY_ARRAY;
    }
    return annotationMappings.map((annotationMapping) => {
      return calculateAnnotationMappingModelStyling(instanceGroups, annotationMapping);
    });
  }, [annotationMappings, models, instanceGroups]);
}

function calculateAnnotationMappingModelStyling(
  instanceGroups: InstanceStylingGroup[],
  annotationMapping: AnnotationModelDataResult
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => {
      return getMappedStyleGroupFromAssetIds(annotationMapping, group);
    })
    .filter(isDefined);

  return { model: annotationMapping.model, styleGroups };
}

function useVolumeMappingInstanceStyleGroups(
  dmVolumeMappings: PointCloudVolumeWithModel[],
  models: PointCloudModelOptions[],
  instanceGroups: Array<FdmInstanceStylingGroup | ClassicAssetStylingGroup>
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (dmVolumeMappings.length === 0) {
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
  instanceGroups: FdmInstanceStylingGroup[],
  dmVolumeMapping: PointCloudVolumeWithModel
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => getDMMappedStyleGroupFromAssetInstances(dmVolumeMapping, group))
    .filter(isDefined);

  return { model: dmVolumeMapping.model, styleGroups };
}

function getMappedStyleGroupFromAssetIds(
  annotationMapping: AnnotationModelDataResult,
  instanceGroup: InstanceStylingGroup
): PointCloudVolumeStylingGroup | undefined {
  if (instanceGroup.style.pointcloud === undefined) {
    return undefined;
  }

  const uniqueAnnotationIds = new Set<number>();
  const assetReferenceKeySet = new Set(getInstanceKeysFromStylingGroup(instanceGroup));

  const matchedAnnotationModels = annotationMapping.annotations.filter((annotation) => {
    const instanceReferencesInAnnotation =
      getInstanceReferencesFromPointCloudAnnotation(annotation);

    const annotationReferencesInstance = instanceReferencesInAnnotation.some((instanceReference) =>
      assetReferenceKeySet.has(createInstanceReferenceKey(instanceReference))
    );

    if (annotationReferencesInstance && !uniqueAnnotationIds.has(annotation.id)) {
      uniqueAnnotationIds.add(annotation.id);
      return true;
    }
    return false;
  });

  if (matchedAnnotationModels.length === 0) {
    return undefined;
  }

  return {
    pointCloudVolumes: matchedAnnotationModels.map((annotationModel) => annotationModel.id),
    style: instanceGroup.style.pointcloud
  };
}

function getDMMappedStyleGroupFromAssetInstances(
  dmVolumeMapping: PointCloudVolumeWithModel,
  instanceGroup: FdmInstanceStylingGroup
): PointCloudVolumeStylingGroup | undefined {
  const uniqueVolumeRefs = new Set<string>();
  const assetIdsSet = new Set(instanceGroup.fdmAssetExternalIds.map(createFdmKey));

  const matchedVolumeRefModels = dmVolumeMapping.pointCloudVolumes.reduce<DMInstanceRef[]>(
    (acc, pointCloudVolume, index) => {
      if (typeof pointCloudVolume !== 'number') {
        const assetRef = dmVolumeMapping.assets?.[index] as DMInstanceRef;
        const volumeInstanceRef = createFdmKey(pointCloudVolume);
        const isAssetIdInMapping = assetIdsSet.has(createFdmKey(assetRef));

        if (isAssetIdInMapping && !uniqueVolumeRefs.has(volumeInstanceRef)) {
          uniqueVolumeRefs.add(volumeInstanceRef);
          acc.push(pointCloudVolume);
        }
      }
      return acc;
    },
    []
  );

  if (matchedVolumeRefModels.length === 0) {
    return undefined;
  }

  return {
    pointCloudVolumes: matchedVolumeRefModels,
    style: instanceGroup.style.pointcloud ?? {}
  };
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

function usePointCloudVolumesWithModel(
  models: PointCloudModelOptions[]
): PointCloudVolumeWithModel[] {
  const viewerModels = use3dModels();
  const classicAddModelOptions = useModelIdRevisionIdFromModelOptions(models);

  const pointCloudViewerModels = viewerModels.filter(
    (model): model is CognitePointCloudModel<DataSourceType> => model.type === 'pointcloud'
  );
  const matchedPointCloudModels = useMatchedPointCloudModels(
    pointCloudViewerModels,
    classicAddModelOptions
  );

  return useMemo(() => {
    if (matchedPointCloudModels.length === 0 || pointCloudViewerModels.length === 0) {
      return models.map((model) => ({
        model,
        pointCloudVolumes: EMPTY_ARRAY,
        assets: []
      }));
    }

    return matchedPointCloudModels.map(({ viewerModel, model }) => {
      const pointCloudVolumesWithAsset = viewerModel.stylableObjects.reduce<
        Array<{
          pointCloudVolume: PointCloudVolumeId;
          asset: InstanceReference;
        }>
      >((acc, pointCloudObjectData) => {
        const instanceReferences = getInstanceReferencesFromPointCloudVolume(pointCloudObjectData);
        instanceReferences.forEach((instanceReference) => {
          acc.push({
            pointCloudVolume: getVolumeAnnotationId(pointCloudObjectData),
            asset: instanceReference
          });
        });

        return acc;
      }, []);

      const pointCloudVolumes = pointCloudVolumesWithAsset.map((data) => data.pointCloudVolume);
      const assets = pointCloudVolumesWithAsset.map((data) => data.asset);
      return { model: model as PointCloudModelOptions, pointCloudVolumes, assets };
    });
  }, [matchedPointCloudModels, pointCloudViewerModels, models]);
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
