import { Asset, FileInfo } from '@cognite/sdk';
import { ResourceType, Status } from 'modules/types';

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  type: ResourceType;
  endpoint: SelectionEndpointType;
  filter: any;
};

export type MatchFields = {
  assets?: string;
  files?: string;
  diagrams?: string;
};

export type ResourceObjectType = {
  assets?: Asset[];
  files?: FileInfo[];
};
export type ResourceEntriesType = [
  'assets' | 'files',
  Asset[] | FileInfo[] | undefined
];

export interface Workflow {
  diagrams?: ResourceSelection;
  resources?: ResourceSelection[];
  options: WorkflowOptions;
  steps: WorkflowSteps;
  status?: Status;
  jobId?: number;
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
