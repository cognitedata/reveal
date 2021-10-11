import { createAction } from '@reduxjs/toolkit';

import { SearchOptionSortBy } from 'modules/api/savedSearches/types';
import { Modules } from 'modules/sidebar/types';

import {
  SET_SORT_BY_OPTIONS,
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
} from './constants';

export const setSortByOptions =
  createAction<SearchOptionSortBy>(SET_SORT_BY_OPTIONS);
export const setResultPanelWidth = createAction<number>(SET_RESULT_PANEL_WIDTH);
export const setActivePanel = createAction<Modules>(SET_ACTIVE_PANEL);
