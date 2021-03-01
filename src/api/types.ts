import { OCRAnnotation } from 'src/api/ocr/types';

export enum DetectionModelType {
  Text = 1,
  Tag,
  GDPR,
}

export interface DetectionModelDataProvider {
  postJob(requestBody: any): Promise<AnnotationJobResponse>;
  fetchJobById(jobId: number): Promise<AnnotationJobResponse>;
}

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export type Annotation = OCRAnnotation; // later will be at least " | TagAnnotation"
export type AnnotationJobResultItem = {
  annotations: Array<Annotation>;
  width: number;
  height: number;
};

export interface AnnotationJobBase {
  status: JobStatus;
  createdTime: number;
  jobId: number;
  statusTime: number;
}
export interface AnnotationJobQueued extends AnnotationJobBase {
  startTime: null;
  status: 'Queued';
}
export interface AnnotationJobRunning extends AnnotationJobBase {
  startTime: number;
  status: 'Running';
}
export interface AnnotationJobCompleted extends AnnotationJobBase {
  status: 'Completed';
  createdTime: number;
  startTime: number;
  statusTime: number;
  jobId: number;
  fileId: number;
  fileExternalId: string;
  useCache?: boolean;
  items: Array<AnnotationJobResultItem>;
}
export interface AnnotationJobFailed extends AnnotationJobBase {
  status: 'Failed';
}

export type AnnotationJobResponse =
  | AnnotationJobQueued
  | AnnotationJobRunning
  | AnnotationJobCompleted
  | AnnotationJobFailed;

// some extension over api response for more convenient usage in app
export type AnnotationJob = AnnotationJobResponse & {
  type: DetectionModelType;
};
