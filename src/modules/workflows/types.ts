import { ResourceType } from 'modules/sdk-builder/types';

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  type: ResourceType;
  endpoint: SelectionEndpointType;
  filter: any;
};

export type WorkflowStep =
  | 'diagramSelection'
  | 'resourceSelection'
  | 'config'
  | 'review'
  | 'finished';

export type WorkflowOptions = {
  partialMatch: boolean;
  grayscale: boolean;
  minTokens: number;
};

export interface Item {
  id: number;
  assetId?: number;
}
