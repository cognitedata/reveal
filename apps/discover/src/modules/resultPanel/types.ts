import { SavedSearchSortBy } from '@cognite/discover-api-types';

import { Modules } from 'modules/sidebar/types';

import {
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
  SET_SORT_BY_OPTIONS,
} from './constants';

export interface ResultPanelState {
  sortBy: SavedSearchSortBy;
  panelWidth?: number;
  activePanel?: Modules;
}

interface SetResultPanelWidth {
  type: typeof SET_RESULT_PANEL_WIDTH;
  payload: number;
}

interface SetActivePanel {
  type: typeof SET_ACTIVE_PANEL;
  payload: Modules;
}

interface SetSortByOptions {
  type: typeof SET_SORT_BY_OPTIONS;
  payload: SavedSearchSortBy;
}

export type ResultPanelActions =
  | SetResultPanelWidth
  | SetActivePanel
  | SetSortByOptions;
