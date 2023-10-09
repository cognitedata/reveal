import sdk from '@cognite/cdf-sdk-singleton';

import {
  VisionJobResponse,
  DetectionModelDataProvider,
  DetectionModelParams,
} from './types';

// tag and ocr api quite similar that's why this base class exists
// in further, when api will be normalized, all these provides should be removed in favor
// of using someone generic provider like that one

export abstract class BaseDetectionModelDataProvider
  implements DetectionModelDataProvider
{
  protected abstract url: string;
  protected abstract features: string[];
  protected abstract getParams: (params?: object) => object;
  protected customHeaders = {};

  postJob(fileIds: number[], parameters?: DetectionModelParams) {
    return sdk
      .post<VisionJobResponse>(this.url, {
        headers: this.customHeaders,
        data: {
          items: fileIds.map((id) => {
            return {
              fileId: id,
            };
          }),
          features: this.features,
          parameters: this.getParams(parameters),
        },
      })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          return response.data;
        }
        throw new Error(JSON.stringify(response));
      })
      .catch((error) => {
        throw new Error(JSON.stringify(error.errorMessage || error.message));
      });
  }

  fetchJobById(jobId: number): Promise<VisionJobResponse> {
    return sdk
      .get<VisionJobResponse>(`${this.url}/${jobId}`)
      .then((response) => {
        if (response.status === 200) {
          return response.data;
        }
        throw new Error(JSON.stringify(response));
      })
      .catch((error) => {
        throw new Error(JSON.stringify(error.errorMessage) || error.message);
      });
  }
}
