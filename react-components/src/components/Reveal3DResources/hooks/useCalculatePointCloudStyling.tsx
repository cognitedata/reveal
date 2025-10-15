import {
  type CognitePointCloudModel,
  type DataSourceType,
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
import {
  createInstanceReferenceKey,
  InstanceReference,
  isDmsInstance
} from '../../../utilities/instanceIds';
import { getInstanceKeysFromStylingGroup } from '../utils';
import {
  getInstanceReferencesFromPointCloudAnnotation,
  getInstanceReferencesFromPointCloudVolume,
  getVolumeAnnotationId
} from '../../CacheProvider/utils';
import { FdmKey, PointCloudVolumeId } from '../../CacheProvider/types';

type PointCloudVolumeWithModel = {
  model: PointCloudModelOptions;
  volumesWithAsset: Array<{ pointCloudVolume: PointCloudVolumeId; asset: InstanceReference }>;
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

  const modelsWithMappings = usePointCloudVolumesWithModel(models);

  const dmInstanceStyleGroups = useDmVolumeInstanceStyleGroups(
    modelsWithMappings,
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
      return getMappedStyleGroupFromInstanceReferences(annotationMapping, group);
    })
    .filter(isDefined);

  return { model: annotationMapping.model, styleGroups };
}

function useDmVolumeInstanceStyleGroups(
  modelsWithMappings: PointCloudVolumeWithModel[],
  models: PointCloudModelOptions[],
  instanceGroups: Array<InstanceStylingGroup>
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (modelsWithMappings.length === 0) {
      return EMPTY_ARRAY;
    }
    return modelsWithMappings.map((modelWithVolumes) => {
      return calculateDmVolumeModelStyling(instanceGroups, modelWithVolumes);
    });
  }, [modelsWithMappings, models, instanceGroups]);
}

function calculateDmVolumeModelStyling(
  instanceGroups: InstanceStylingGroup[],
  modelWithVolumes: PointCloudVolumeWithModel
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => createDmVolumePointCloudStyleGroup(modelWithVolumes, group))
    .filter(isDefined);

  return { model: modelWithVolumes.model, styleGroups };
}

function getMappedStyleGroupFromInstanceReferences(
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

    const annotationContainsRelevantInstance = instanceReferencesInAnnotation.some(
      (instanceReference) => assetReferenceKeySet.has(createInstanceReferenceKey(instanceReference))
    );

    if (annotationContainsRelevantInstance && !uniqueAnnotationIds.has(annotation.id)) {
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

function createDmVolumePointCloudStyleGroup(
  dmVolumeMapping: PointCloudVolumeWithModel,
  instanceGroup: InstanceStylingGroup
): PointCloudVolumeStylingGroup | undefined {
  const uniqueVolumeRefs = new Set<FdmKey>();
  const assetInstancesSet = new Set(getInstanceKeysFromStylingGroup(instanceGroup));

  const matchedVolumeRefModels = dmVolumeMapping.volumesWithAsset.reduce<DMInstanceRef[]>(
    (acc, { pointCloudVolume, asset }) => {
      if (isDmsInstance(pointCloudVolume)) {
        const volumeInstanceRef = createFdmKey(pointCloudVolume);
        const isAssetReferenceInStyleGroup = assetInstancesSet.has(
          createInstanceReferenceKey(asset)
        );

        if (isAssetReferenceInStyleGroup && !uniqueVolumeRefs.has(volumeInstanceRef)) {
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
        volumesWithAsset: []
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

      return {
        model: { type: 'pointcloud', ...model },
        volumesWithAsset: pointCloudVolumesWithAsset
      };
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
    return data.volumesWithAsset.map((volumeWithAsset) => volumeWithAsset.pointCloudVolume);
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
