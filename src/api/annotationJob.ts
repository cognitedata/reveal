import { OCRAnnotation } from 'src/api/ocrAnnotations';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type Annotation = OCRAnnotation; // later will be at least " | TagAnnotation"
export type AnnotationJobResultItem = {
  annotations: Array<Annotation>;
  width: number;
  height: number;
};

interface AnnotationJobBase {
  status: JobStatus;
  createdTime: number;
  jobId: number;
  statusTime: number;
}
interface AnnotationJobQueued extends AnnotationJobBase {
  startTime: null;
  status: 'QUEUED';
}
interface AnnotationJobRunning extends AnnotationJobBase {
  startTime: number;
  status: 'RUNNING';
}
interface AnnotationJobCompleted extends AnnotationJobBase {
  status: 'COMPLETED';
  createdTime: number;
  startTime: number;
  statusTime: number;
  jobId: number;
  fileId: number;
  fileExternalId: string;
  useCache?: boolean;
  items: Array<AnnotationJobResultItem>;
}
interface AnnotationJobFailed extends AnnotationJobBase {
  status: 'FAILED';
}

export type AnnotationJobResponse =
  | AnnotationJobQueued
  | AnnotationJobRunning
  | AnnotationJobCompleted
  | AnnotationJobFailed;

export async function putFilesToProcessingQueue(
  fileIds: Array<number>
): Promise<Array<AnnotationJobResponse>> {
  const url = `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/ocr`;

  const promisesArr = fileIds.map((fileId) => {
    return sdk
      .post<AnnotationJobResponse>(url, {
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
  });

  return Promise.all(promisesArr);
}

export function fetchJobById(jobId: number) {
  const url = `${sdk.getBaseUrl()}/api/playground/projects/${
    sdk.project
  }/context/vision/ocr/${jobId}`;

  return sdk.get<AnnotationJobResponse>(url).then((response) => {
    if (response.status === 200) {
      // todo VIS-54 either change JobStatus, or remove conversion if api will return uppercase status
      response.data.status = response.data.status.toUpperCase() as JobStatus;
      return response;
    }
    // todo: handle error
    throw new Error(JSON.stringify(response));
  });
}
