import { createAction } from '@reduxjs/toolkit';

import {
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
  BooleanSelection,
  SET_COLORED_WELLBORES,
  SET_PREREQUISITE_DATA,
  TOGGLE_SELECTED_WELL,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
  SET_GO_BACK_NAVIGATION_PATH,
  SetPrerequisiteData,
  ToggleSelectedWell,
  ToggleSelectedWellboreOfWell,
  StickChartHighlightEvent,
  STICK_CHART_HIGHLIGHT_EVENT,
} from './types';

export const WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS =
  'WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS';

const setPrerequisiteData = createAction<SetPrerequisiteData['payload']>(
  SET_PREREQUISITE_DATA
);

const toggleSelectedWell =
  createAction<ToggleSelectedWell['payload']>(TOGGLE_SELECTED_WELL);

const toggleSelectedWellboreOfWell = createAction<
  ToggleSelectedWellboreOfWell['payload']
>(TOGGLE_SELECTED_WELLBORE_OF_WELL);

const setGoBackNavigationPath = createAction<string>(
  SET_GO_BACK_NAVIGATION_PATH
);

const setColoredWellbores = createAction<boolean>(SET_COLORED_WELLBORES);

const setSelectedRelatedDocumentColumns = createAction<BooleanSelection>(
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS
);

const stickChartHighlightEvent = createAction<
  StickChartHighlightEvent['payload']
>(STICK_CHART_HIGHLIGHT_EVENT);

export const wellInspectActions = {
  setPrerequisiteData,
  setGoBackNavigationPath,
  toggleSelectedWell,
  toggleSelectedWellboreOfWell,
  setColoredWellbores,
  setSelectedRelatedDocumentColumns,
  stickChartHighlightEvent,
};
