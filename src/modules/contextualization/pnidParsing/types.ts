import { Asset, FileInfo } from 'cognite-sdk-v3/dist/src';

export type PnidsParsingJobSchema = {
  jobId?: number;
  status?: 'Completed' | 'Failed' | string;
  statusCount?: ApiStatusCount;
  items?: { fileId: number }[];
  annotationCounts?: { [fileId: number]: FileAnnotationsCount };
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
    searchField: string | string[];
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

export type RetrieveResultsResponseItem = {
  fileId: number;
  annotations: Array<{
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
};
