import {
  type CognitePointCloudModel,
  type DataSourceType,
  type NodeAppearance
} from '@cognite/reveal';
import {
  type DefaultResourceStyling,
  type PointCloudModelOptions,
  type ClassicAssetStylingGroup,
  type TypedReveal3DModel,
  type FdmInstanceStylingGroup,
  type StyledPointCloudModel,
  type InstanceStylingGroup
} from '../types';
import { useContext, useMemo } from 'react';
import { isSameModel } from '../../../utilities/isSameModel';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { type PointCloudVolumeStylingGroup } from '../../PointCloudContainer/types';
import { isDefined } from '../../../utilities/isDefined';
import {
  createInstanceReferenceKey,
  type InstanceReferenceKey,
  type InstanceReference
} from '../../../utilities/instanceIds';
import { getInstanceKeysFromStylingGroup } from '../utils';
import {
  getInstanceReferencesFromPointCloudVolume,
  getVolumeAnnotationId
} from '../../CacheProvider/utils';
import { type PointCloudVolumeId } from '../../CacheProvider/types';
import { UseCalculatePointCloudStylingContext } from './useCalculatePointCloudStyling.context';
import { useMatchedPointCloudModels } from './useMatchedPointCloudModels';

type PointCloudVolumeWithModel = {
  model: PointCloudModelOptions;
  volumesWithAsset: Array<{ pointCloudVolume: PointCloudVolumeId; instance: InstanceReference }>;
};

export const useCalculatePointCloudStyling = (
  models: TypedReveal3DModel[],
  instanceGroups: InstanceStylingGroup[],
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
  const modelsWithMappings = usePointCloudVolumesWithModel(models);

  const instanceStyleGroups = useVolumeInstanceStyleGroups(
    modelsWithMappings,
    models,
    instanceGroups
  );

  return instanceStyleGroups;
}

function useVolumeInstanceStyleGroups(
  modelsWithMappings: PointCloudVolumeWithModel[],
  models: PointCloudModelOptions[],
  instanceGroups: InstanceStylingGroup[]
): StyledPointCloudModel[] {
  return useMemo(() => {
    if (modelsWithMappings.length === 0) {
      return EMPTY_ARRAY;
    }
    return modelsWithMappings.map((modelWithVolumes) => {
      return calculateVolumeModelStyling(instanceGroups, modelWithVolumes);
    });
  }, [modelsWithMappings, models, instanceGroups]);
}

function calculateVolumeModelStyling(
  instanceGroups: InstanceStylingGroup[],
  modelWithVolumes: PointCloudVolumeWithModel
): StyledPointCloudModel {
  const styleGroups = instanceGroups
    .map((group) => createVolumePointCloudStyleGroup(modelWithVolumes, group))
    .filter(isDefined);

  return { model: modelWithVolumes.model, styleGroups };
}

function createVolumePointCloudStyleGroup(
  modelWithVolumes: PointCloudVolumeWithModel,
  instanceGroup: InstanceStylingGroup
): PointCloudVolumeStylingGroup | undefined {
  const assetInstancesSet = new Set<InstanceReferenceKey>(
    getInstanceKeysFromStylingGroup(instanceGroup)
  );

  const matchedVolumeRefModels = modelWithVolumes.volumesWithAsset
    .filter(({ instance }) => assetInstancesSet.has(createInstanceReferenceKey(instance)))
    .map(({ pointCloudVolume }) => pointCloudVolume);

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
  const { use3dModels } = useContext(UseCalculatePointCloudStylingContext);

  const viewerModels = use3dModels();

  const pointCloudViewerModels = viewerModels.filter(
    (model): model is CognitePointCloudModel<DataSourceType> => model.type === 'pointcloud'
  );
  const matchedPointCloudModels = useMatchedPointCloudModels(pointCloudViewerModels, models);

  return useMemo(() => {
    if (matchedPointCloudModels.length === 0 || pointCloudViewerModels.length === 0) {
      return models.map((model) => ({
        model,
        volumesWithAsset: []
      }));
    }

    return matchedPointCloudModels.map(({ viewerModel, model }) => {
      const pointCloudVolumesWithAsset = viewerModel.stylableObjects.flatMap(
        (pointCloudObjectData) =>
          getInstanceReferencesFromPointCloudVolume(pointCloudObjectData).map(
            (instanceReference) => ({
              pointCloudVolume: getVolumeAnnotationId(pointCloudObjectData),
              instance: instanceReference
            })
          )
      );

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

  const accumulatedStyleGroups = styleGroup.reduce<StyledPointCloudModel[]>(
    (accumulatedGroups, currentGroup) => {
      const existingGroupWithModel = accumulatedGroups.find((group) =>
        isSameModel(group.model, currentGroup.model)
      );
      existingGroupWithModel?.styleGroups.push(...currentGroup.styleGroups);
      return accumulatedGroups;
    },
    initialStyleGroups
  );

  return accumulatedStyleGroups.filter((group) => group.styleGroups.length > 0);
}
