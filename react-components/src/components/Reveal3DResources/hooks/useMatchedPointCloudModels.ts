import {
  type CognitePointCloudModel,
  type DataSourceType,
  type AddModelOptions
} from '@cognite/reveal';
import { useMemo } from 'react';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { isSameModel } from '../../../utilities/isSameModel';

type MatchedPointCloudModel = {
  viewerModel: CognitePointCloudModel<DataSourceType>;
  model: AddModelOptions<DataSourceType>;
};

export function useMatchedPointCloudModels(
  viewerModels: Array<CognitePointCloudModel<DataSourceType>>,
  modelOptions: Array<AddModelOptions<DataSourceType>>
): MatchedPointCloudModel[] {
  return useMemo(() => {
    return viewerModels.flatMap((viewerModel) => {
      if (viewerModel.type !== 'pointcloud') {
        return EMPTY_ARRAY;
      }
      const model = viewerModel;
      const matchedModel = modelOptions.find((modelOption) =>
        isSameModel(model.modelIdentifier, modelOption)
      );
      return matchedModel !== undefined ? [{ viewerModel, model: matchedModel }] : EMPTY_ARRAY;
    });
  }, [viewerModels, modelOptions]);
}
