import { CogniteInternalId, CogniteExternalId } from '@cognite/sdk';

// Vision API schema types
export declare type FileIdEither = FileInternalId | FileExternalId;
export interface FileInternalId {
  fileId: CogniteInternalId;
}
export interface FileExternalId {
  fileExternalId: CogniteExternalId;
}

export type JobStatus =
  | 'Queued'
  | 'Collecting'
  | 'Running'
  | 'Completed'
  | 'Failed';

export type RegionType = 'points' | 'rectangle' | 'polygon' | 'polyline';

export type Vertex = {
  x: number;
  y: number;
};

export type AnnotationRegion = {
  shape: RegionType;
  vertices: Array<Vertex>;
};

export interface DetectedAnnotation {
  text: string;
  region: AnnotationRegion;
  confidence: number;
  assetIds?: Array<number>;
}

export type VisionJobFailedItem = {
  errorMessage: string;
  items: Array<FileInternalId & Partial<FileExternalId>>;
};

export type VisionJobResultItem = FileInternalId &
  Partial<FileExternalId> & {
    annotations: Array<DetectedAnnotation>;
    width?: number;
    height?: number;
  };

export interface VisionJobBase {
  status: JobStatus;
  createdTime: number;
  jobId: number;
  statusTime: number;
}
export interface VisionJobQueued extends VisionJobBase {
  startTime: null;
  status: 'Queued';
}
export interface VisionJobRunning extends VisionJobBase {
  startTime: number;
  status: 'Running';
  items?: Array<VisionJobResultItem>;
  failedItems?: Array<VisionJobFailedItem>;
}
export interface VisionJobCompleted extends VisionJobBase {
  status: 'Completed';
  createdTime: number;
  startTime: number;
  statusTime: number;
  jobId: number;
  items: Array<VisionJobResultItem>;
  failedItems?: Array<VisionJobFailedItem>;
}
export interface VisionJobFailed extends VisionJobBase {
  status: 'Failed';
}

export type VisionJobResponse =
  | VisionJobQueued
  | VisionJobRunning
  | VisionJobCompleted
  | VisionJobFailed;

// Model parameters
export interface ParamsOCR {
  useCache: boolean;
}
export interface ParamsTagDetection {
  useCache: boolean;
  partialMatch: boolean;
  assetSubtreeIds: Array<number>;
}

export interface ParamsObjectDetection {
  threshold: number;
}

export interface ParamsCustomModel {
  modelJobId?: number;
  threshold: number;
}

export type DetectionModelParams =
  | ParamsOCR
  | ParamsTagDetection
  | ParamsObjectDetection
  | ParamsCustomModel;

// App specific types
export enum VisionDetectionModelType {
  OCR = 1,
  TagDetection,
  ObjectDetection,
  CustomModel,
}
export interface DetectionModelDataProvider {
  postJob(
    requestBody: any,
    parameters?: DetectionModelParams
  ): Promise<VisionJobResponse>;
  fetchJobById(jobId: number): Promise<VisionJobResponse>;
}

// some extension over api response for more convenient usage in app
export type VisionJob = VisionJobResponse & {
  type: VisionDetectionModelType;
};
