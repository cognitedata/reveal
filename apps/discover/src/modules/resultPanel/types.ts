import { SearchOptionSortBy } from 'modules/api/savedSearches/types';
import { Modules } from 'modules/sidebar/types';

import {
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
  SET_SORT_BY_OPTIONS,
} from './constants';

export interface ResultPanelState {
  sortBy: SearchOptionSortBy;
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
  payload: SearchOptionSortBy;
}

export type ResultPanelActions =
  | SetResultPanelWidth
  | SetActivePanel
  | SetSortByOptions;
