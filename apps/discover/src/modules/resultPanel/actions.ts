import { createAction } from '@reduxjs/toolkit';

import { SavedSearchSortBy } from '@cognite/discover-api-types';

import { Modules } from 'modules/sidebar/types';

import {
  SET_SORT_BY_OPTIONS,
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
} from './constants';

export const setSortByOptions =
  createAction<SavedSearchSortBy>(SET_SORT_BY_OPTIONS);
export const setResultPanelWidth = createAction<number>(SET_RESULT_PANEL_WIDTH);
export const setActivePanel = createAction<Modules | undefined>(
  SET_ACTIVE_PANEL
);
