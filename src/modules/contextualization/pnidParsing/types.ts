import { Asset, FileInfo } from '@cognite/sdk';

export type PnidFailedFileSchema = { fileId: number; errorMessage?: string };
export type PnidsParsingJobSchema = {
  jobId?: number;
  status?: 'Completed' | 'Failed' | string;
  statusCount?: ApiStatusCount;
  items?: { fileId: number }[];
  numFiles?: number;
  annotationCounts?: { [fileId: number]: FileAnnotationsCount };
  failedFiles?: Array<PnidFailedFileSchema>;
  selectedDiagramIds?: number[];
};
export type PnidsConvertJobSchema = {
  createdTime: number;
  grayscale: boolean;
  items: Array<{
    errorMessage?: string;
    fileId?: number;
  }>;
  jobId: number;
  numFiles?: number;
  startTime?: number;
  status?: string;
  statusCount?: {
    failed?: number;
    completed?: number;
  };
  statusTime?: number;
};

export interface PnidResponseEntity {
  text: string;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
  page?: number;
  items: { id: number; resourceType: 'asset' | 'file'; externalId?: string }[];
}

export type StartPnidParsingJobProps = {
  diagrams: FileInfo[];
  resources: { assets?: Asset[]; files?: FileInfo[] };
  options: {
    minTokens: number;
    partialMatch: boolean;
    matchFields: {
      files?: keyof FileInfo;
      assets?: keyof Asset;
    };
  };
  workflowId: number;
};

export type PollJobResultsProps = {
  workflowId: number;
  jobId: number;
};

export type FileAnnotationsCount = {
  existingFilesAnnotations: number;
  existingAssetsAnnotations: number;
  newFilesAnnotations: number;
  newAssetAnnotations: number;
};

export type Vertix = {
  x: number;
  y: number;
};

export type Vertices = [Vertix, Vertix, Vertix, Vertix]; // {"x":xMin, "y":"yMin"},{"x":xMax, "y": yMin}, {"x": xMax: "y":yMax}, {"x": xMin, "y": yMax}
export type BoundingBox = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

export type RetrieveResultsResponseItem = {
  fileId: number;
  errorMessage?: string;
  annotations?: Array<{
    text: string;
    confidence: number;
    entities: {
      id: number;
      resourceType: 'asset' | 'file';
      externalId?: string;
      [key: string]: any;
    }[];
    region: {
      shape: 'rectangle'; // diagram endpoints will always return rectangle
      vertices: Vertices;
      page: number;
    };
  }>;
};
export type RetrieveResultsResponseItems = Array<RetrieveResultsResponseItem>;

export type ApiStatusCount = {
  completed?: number;
  running?: number;
  queued?: number;
  failed?: number;
};

export type JobStatus =
  | 'incomplete'
  | 'ready'
  | 'loading'
  | 'running'
  | 'done'
  | 'error';
