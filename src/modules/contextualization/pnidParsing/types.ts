import { FileInfo } from 'cognite-sdk-v3/dist/src';

export type PnidsParsingJobSchema = {
  jobId?: number;
  status: 'Completed' | 'Failed' | string;
  items?: { fileId: number }[];
  annotationCounts?: { [fileId: number]: FileAnnotationsCount };
};

export interface PnidResponseEntity {
  text: string;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
  page?: number;
}

export type StartPnidParsingJobProps = {
  files: FileInfo[];
  entities: Object[];
  options: {
    minTokens: number;
    partialMatch: boolean;
    searchField: string | string[];
  };
  workflowId: number;
  diagrams: any;
  resources: any;
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
    entities: Object[];
    region: {
      shape: 'rectangle'; // diagram endpoints will always return rectangle
      vertices: Vertices;
      page: number;
    };
  }>;
};
export type RetrieveResultsResponseItems = Array<RetrieveResultsResponseItem>;
