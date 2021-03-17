import { ResourceType } from 'modules/sdk-builder/types';

export type SelectionFilter = 'none' | 'missingAssetId';

export interface Item {
  id: number;
  assetId?: number;
}

export type SelectionEndpointType = 'list' | 'retrieve';

export type ResourceSelection = {
  id: string;
  type: ResourceType;
  endpoint: SelectionEndpointType;
  query: any;
  filter?: SelectionFilter;
};

export type ResourceSelectionUpdate = {
  id: string;
  filter?: SelectionFilter;
};

export type PendingResourceSelection = Omit<ResourceSelection, 'id'>;
