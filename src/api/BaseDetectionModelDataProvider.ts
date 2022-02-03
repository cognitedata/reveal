import sdk from '@cognite/cdf-sdk-singleton';
import {
  AnnotationJobResponse,
  DetectionModelDataProvider,
  DetectionModelParams,
} from 'src/api/types';

// tag and ocr api quite similar that's why this base class exists
// in further, when api will be normalized, all these provides should be removed in favor
// of using some one generic provider like that one
export abstract class BaseDetectionModelDataProvider
  implements DetectionModelDataProvider
{
  protected abstract url: string;

  postJob(fileIds: number[], parameters?: DetectionModelParams) {
    return sdk
      .post<AnnotationJobResponse>(this.url, {
        data: {
          items: fileIds.map((id) => {
            return {
              fileId: id,
            };
          }),
          ...parameters,
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

  fetchJobById(jobId: number): Promise<AnnotationJobResponse> {
    return sdk
      .get<AnnotationJobResponse>(`${this.url}/${jobId}`)
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
