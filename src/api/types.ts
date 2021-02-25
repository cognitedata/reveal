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

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

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
  status: 'QUEUED';
}
export interface AnnotationJobRunning extends AnnotationJobBase {
  startTime: number;
  status: 'RUNNING';
}
export interface AnnotationJobCompleted extends AnnotationJobBase {
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
export interface AnnotationJobFailed extends AnnotationJobBase {
  status: 'FAILED';
}

export type AnnotationJobResponse =
  | AnnotationJobQueued
  | AnnotationJobRunning
  | AnnotationJobCompleted
  | AnnotationJobFailed;
