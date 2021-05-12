import { Asset, FileInfo } from '@cognite/sdk';
import { ResourceType, Status } from 'modules/types';

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  type: ResourceType;
  endpoint: SelectionEndpointType;
  filter: any;
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
  step: WorkflowStep;
  status?: Status;
}

export type WorkflowStep =
  | 'diagramSelection'
  | 'resourceSelectionAssets'
  | 'resourceSelectionFiles'
  | 'config'
  | 'review'
  | 'diagramPreview';

export type WorkflowOptions = {
  partialMatch: boolean;
  grayscale: boolean;
  minTokens: number;
};
