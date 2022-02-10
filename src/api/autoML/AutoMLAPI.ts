import sdk from '@cognite/cdf-sdk-singleton';
import { CDFResourceId } from 'src/api/types';
import { ToastUtils } from 'src/utils/ToastUtils';

import {
  AutoMLDownload,
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

  public static downloadAutoMLModel = async (
    id: number
  ): Promise<AutoMLDownload> => {
    const response = await sdk.get(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl/${id}/download`
    );

    return response.data || {};
  };

  public static startAutoMLJob = async (
    name: string,
    modelType: AutoMLModelType,
    fileIds: CDFResourceId[]
  ): Promise<AutoMLTrainingJobPostRequest | undefined> => {
    const data = {
      data: {
        items: fileIds,
        name,
        modelType,
      },
    };

    try {
      const response = await sdk.post(
        `${sdk.getBaseUrl()}/api/playground/projects/${
          sdk.project
        }/context/vision/automl`,
        data
      );

      return response.data;
    } catch (error) {
      const formatedError = `Could not start the training job, error: ${JSON.stringify(
        error,
        null,
        4
      )}`;
      ToastUtils.onFailure(formatedError);
      console.error(formatedError);
    }
    return undefined;
  };
}
