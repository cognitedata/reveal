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

export type BaseVisionJobAnnotation = {
  __typename: VisionDetectionModelType;
  text: string;
  confidence?: number;
};

export type TextDetectionJobAnnotation = BaseVisionJobAnnotation & {
  __typename: VisionDetectionModelType.OCR;
  region: AnnotationRegion;
};

export type ObjectDetectionJobAnnotation = BaseVisionJobAnnotation & {
  __typename: VisionDetectionModelType.ObjectDetection;
  region: AnnotationRegion;
};

export type TagDetectionJobAnnotation = BaseVisionJobAnnotation & {
  __typename: VisionDetectionModelType.TagDetection;
  region: AnnotationRegion;
  assetIds: CogniteInternalId[];
};

export type GaugeReaderJobAnnotation = BaseVisionJobAnnotation & {
  // __typename: VisionDetectionModelType.GaugeReader;
  region: AnnotationRegion;
  data: {
    // eslint-disable-next-line camelcase
    keypoint_names: string[];
  };
};

export type CusomModelJobAnnotation = BaseVisionJobAnnotation & {
  __typename: VisionDetectionModelType.CustomModel;
  region?: AnnotationRegion; // Custom models can also be classification models
};

export type VisionJobAnnotation =
  | TextDetectionJobAnnotation
  | ObjectDetectionJobAnnotation
  | TagDetectionJobAnnotation
  | GaugeReaderJobAnnotation
  | CusomModelJobAnnotation;

export type VisionJobFailedItem = {
  errorMessage: string;
  items: Array<FileInternalId & Partial<FileExternalId>>;
};

export type VisionJobResultItem = FileInternalId &
  Partial<FileExternalId> & {
    annotations: Array<VisionJobAnnotation>;
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

export interface ParamsGaugeReader {
  gaugeType: string;
}
export interface ParamsCustomModel {
  modelJobId?: number;
  threshold: number;
}

export type DetectionModelParams =
  | ParamsOCR
  | ParamsTagDetection
  | ParamsObjectDetection
  | ParamsGaugeReader
  | ParamsCustomModel;

// App specific types
export enum VisionDetectionModelType {
  OCR = 1,
  TagDetection,
  ObjectDetection,
  GaugeReader,
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
