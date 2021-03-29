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
export type RegionType = 'points' | 'rectangle' | 'polygon' | 'polyline';
export type Vertex = {
  x: number;
  y: number;
};
export type Annotation = {
  text: string;
  confidence: number;
  data: any;
  region?: {
    shape: RegionType;
    vertices: Array<Vertex>;
  };
};

export type AnnotationJobResultItem = {
  fileId: number;
  fileExternalId?: string;
  annotations: Array<Annotation>;
  width?: number;
  height?: number;
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
