import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { Keypoint } from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsTypes';

export enum VisionAPIType {
  OCR = 1,
  TagDetection,
  ObjectDetection,
}

export interface DetectionModelDataProvider {
  postJob(
    requestBody: any,
    parameters?: DetectionModelParams
  ): Promise<AnnotationJobResponse>;
  fetchJobById(jobId: number): Promise<AnnotationJobResponse>;
}

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';
export type RegionType = 'points' | 'rectangle' | 'polygon' | 'polyline';
export type Vertex = {
  x: number;
  y: number;
};
export type AnnotationType =
  | 'vision/ocr'
  | 'vision/tagdetection'
  | 'vision/objectdetection';
export type AnnotationSource =
  | 'vision/ocr' // TODO: use contextApi instead?
  | 'vision/tagdetection'
  | 'vision/objectdetection'
  | 'user';

export type AnnotationRegion = {
  shape: RegionType;
  vertices: Array<Vertex>;
};

export type AnnotationMetadata = {
  keypoint?: boolean;
  keypoints?: Keypoint[];
  color?: string;
};

interface BaseAnnotation {
  text: string;
  data?: AnnotationMetadata;
  region?: AnnotationRegion;
  annotatedResourceId: number;
  annotatedResourceExternalId?: string;
  annotatedResourceType: 'file';
  annotationType: AnnotationType;
  source: AnnotationSource;
  status: AnnotationStatus;
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface LinkedAnnotation extends BaseAnnotation {
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset' | 'file';
}

export type Annotation = LinkedAnnotation;

export interface DetectedAnnotation {
  text: string;
  region: AnnotationRegion;
  confidence: number;
}

export type AnnotationJobResultItem = {
  fileId: number;
  fileExternalId?: string;
  annotations: Array<DetectedAnnotation>;
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
  type: VisionAPIType;
};

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

export type DetectionModelParams =
  | ParamsOCR
  | ParamsTagDetection
  | ParamsObjectDetection;
