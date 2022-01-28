import sdk from '@cognite/cdf-sdk-singleton';
import { IdEither } from '@cognite/sdk';
import {
  AutoMLModel,
  AutoMLModelType,
  AutoMLTrainingJob,
  AutoMLTrainingJobPostRequest,
} from './types';

export class AutoMLAPI {
  public static listAutoMLModels = async (): Promise<AutoMLModel[]> => {
    const response = await sdk.get(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl/list`
    );

    return response.data?.items || [];
  };

  public static getAutoMLModel = async (
    id: number
  ): Promise<AutoMLTrainingJob> => {
    const response = await sdk.get(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl/${id}`
    );
    return response.data || {};
  };

  public static startAutoMLJob = async (
    name: string,
    modelType: AutoMLModelType,
    fileIds: IdEither[]
  ): Promise<AutoMLTrainingJobPostRequest> => {
    const data = {
      data: {
        items: fileIds,
        name,
        modelType,
      },
    };
    const response = await sdk.post(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl`,
      data
    );
    return response.data || {};
  };
}
