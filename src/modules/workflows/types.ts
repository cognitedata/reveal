import { ResourceType, Status } from 'modules/sdk-builder/types';

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  type: ResourceType;
  endpoint: SelectionEndpointType;
  filter: any;
};

export interface Workflow {
  diagrams?: ResourceSelection;
  resources?: ResourceSelection[];
  options: WorkflowOptions;
  step: WorkflowStep;
  status?: Status;
}

export type WorkflowStep =
  | 'diagramSelection'
  | 'resourceSelection'
  | 'config'
  | 'review'
  | 'diagramPreview';

export type WorkflowOptions = {
  partialMatch: boolean;
  grayscale: boolean;
  minTokens: number;
};

export interface Item {
  id: number;
  assetId?: number;
}
