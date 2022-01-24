import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { AutoMLModel, AutoMLTrainingJob } from './types';

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
}
