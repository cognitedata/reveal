import {
  AnnotationJobResponse,
  DetectionModelDataProvider,
  DetectionModelType,
  JobStatus,
} from 'src/api/types';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { getDetectionModelEndpoint } from 'src/api/utils';
import { singleton } from '@keenondrums/singleton';

@singleton
export class OCRDetectionDataProvider implements DetectionModelDataProvider {
  private url = getDetectionModelEndpoint(DetectionModelType.Text);

  // batch mode is not supported yet, but later there could be an array of fileIds
  postJob(fileId: number) {
    return sdk
      .post<AnnotationJobResponse>(this.url, {
        data: { fileId },
      })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          // todo VIS-54 either change JobStatus, or remove conversion if api will return uppercase status
          response.data.status = response.data.status.toUpperCase() as JobStatus;
          return response.data;
        }
        // todo: handle error
        throw new Error(JSON.stringify(response));
      });
  }

  fetchJobById(jobId: number): Promise<AnnotationJobResponse> {
    return sdk
      .get<AnnotationJobResponse>(`${this.url}/${jobId}`)
      .then((response) => {
        if (response.status === 200) {
          // todo VIS-54 either change JobStatus, or remove conversion if api will return uppercase status
          response.data.status = response.data.status.toUpperCase() as JobStatus;
          return response.data;
        }
        // todo: handle error
        throw new Error(JSON.stringify(response));
      });
  }
}
