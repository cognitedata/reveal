import { NodePropertyFilterType } from 'utils';

export type ToolbarState = {
  ghostModeEnabled: boolean;
  nodePropertyFilter: {
    value: NodePropertyFilterType | null;
    isLoading: boolean;
  };
};

export type GhostModeUpdated = {
  type: 'toolbar/ghostModeUpdated';
  payload: boolean;
};

export type SetNodePropertyFilter = {
  type: 'toolbar/setNodePropertyFilterValue';
  payload: NodePropertyFilterType | null;
};

export type SetNodePropertyLoadingState = {
  type: 'toolbar/setNodePropertyFilterLoadingState';
  payload: boolean;
};

export type Actions =
  | GhostModeUpdated
  | SetNodePropertyFilter
  | SetNodePropertyLoadingState;
