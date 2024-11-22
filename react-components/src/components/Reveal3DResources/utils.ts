/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type CognitePointCloudModel,
  type DataSourceType,
  isDMPointCloudModel,
  isClassicPointCloudModel
} from '@cognite/reveal';
import { useMemo } from 'react';
import { isDMIdentifier } from './typeGuards';
import { type PointCloudModelOptions, type CadPointCloudModelWithModelIdRevisionId } from './types';

type MatchedModel = {
  viewerModel: CognitePointCloudModel<DataSourceType>;
  model: CadPointCloudModelWithModelIdRevisionId;
};

export function useModelsWithModelIdAndRevision(
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

export function useMatchedModels(
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
        if (isDMPointCloudModel(model) && isDMIdentifier(modelData)) {
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
