import { CogniteAnnotation } from '@cognite/annotations';
import { AnnotationModel, Asset, FileInfo } from '@cognite/sdk';
import { ResourceType } from 'modules/types';

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  type: ResourceType;
  endpoint: SelectionEndpointType;
  filter: any;
};

export type MatchFields = {
  assets?: keyof Asset | string;
  files?: keyof FileInfo | string;
};

export type ResourceObjectType = {
  assets?: Asset[];
  files?: FileInfo[];
};
export type ResourceEntriesType = [
  'assets' | 'files',
  Asset[] | FileInfo[] | undefined
];

export interface WorkflowState {
  active: number;
  items: { [workflowId: number]: Workflow };
  localStorage: any;
}

export interface Workflow {
  diagrams?: ResourceSelection;
  resources?: ResourceSelection[];
  options: WorkflowOptions;
  steps: WorkflowSteps;
  jobs: {
    list: PnidsParsingJobSchema[];
    status: JobStatus;
    started: boolean;
    selectedDiagramIds: [];
  };
}

export type WorkflowSteps = {
  current: WorkflowStep;
  lastCompleted: WorkflowStep;
};

export type WorkflowStep =
  | 'diagramSelection'
  | 'resourceSelectionAssets'
  | 'resourceSelectionFiles'
  | 'config'
  | 'review'
  | 'diagramPreview';

export type WorkflowOptions = {
  partialMatch: boolean;
  minTokens: number;
  matchFields: MatchFields;
};

export type ModelSelected = 'standard' | 'advanced';

export type ResourceCount = {
  assets?: number | undefined;
  files?: number | undefined;
  diagrams?: number;
};

export type PnidFailedFileSchema = { fileId: number; errorMessage?: string };
export type PnidsParsingJobSchema = {
  jobId?: number;
  status?: 'Completed' | 'Failed' | string;
  statusCount?: ApiStatusCount;
  items?: { fileId: number }[];
  numFiles?: number;
  annotationCounts?: { [fileId: number]: FileAnnotationsCount };
  failedFiles?: Array<PnidFailedFileSchema>;
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
  workflowJobs: PnidsParsingJobSchema[];
  diagrams: FileInfo[];
  resources: { assets?: Asset[]; files?: FileInfo[] };
  options: WorkflowOptions;
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
  | 'rejected'
  | 'ready'
  | 'loading'
  | 'running'
  | 'done'
  | 'error';

export enum AnnotationSource {
  EVENTS = 'events',
  ANNOTATIONS = 'annotations',
}

export type TaggedEventAnnotation = {
  source: AnnotationSource.EVENTS;
  annotation: CogniteAnnotation;
};

export type TaggedAnnotationAnnotation = {
  source: AnnotationSource.ANNOTATIONS;
  annotation: AnnotationModel;
};

export type TaggedAnnotation =
  | TaggedEventAnnotation
  | TaggedAnnotationAnnotation;
