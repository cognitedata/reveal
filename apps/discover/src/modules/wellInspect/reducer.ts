/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';
import map from 'lodash/map';
import set from 'lodash/set';

import { storage } from '@cognite/react-container';

import navigation from 'constants/navigation';

import {
  wellInspectActions,
  WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS,
} from './actions';
import { WellInspectAction, WellInspectState } from './types';
import {
  getBooleanSelection,
  getHighlightedEventsStateKey,
  getInitialSelectedRelatedDocumentsColumns,
} from './utils';

export const initialState: WellInspectState = {
  selectedWellIds: {},
  selectedWellboreIds: {},
  goBackNavigationPath: navigation.SEARCH_WELLS,
  coloredWellbores: false,
  selectedRelatedDocumentsColumns: getInitialSelectedRelatedDocumentsColumns(),
  stickCharts: {
    highlightedNpt: {},
    highlightedNds: {},
  },
};

const {
  setPrerequisiteData,
  setGoBackNavigationPath,
  toggleSelectedWell,
  toggleSelectedWellboreOfWell,
  setColoredWellbores,
  setSelectedRelatedDocumentColumns,
  stickChartHighlightEvent,
} = wellInspectActions;

const wellInspectReducerCreator = createReducer(initialState, (builder) => {
  builder
    .addCase(setPrerequisiteData, (state, action) => {
      state.selectedWellIds = getBooleanSelection(action.payload.wellIds, true);
      state.selectedWellboreIds = getBooleanSelection(
        action.payload.wellboreIds,
        true
      );
    })
    .addCase(setGoBackNavigationPath, (state, action) => {
      state.goBackNavigationPath = action.payload;
    })
    .addCase(toggleSelectedWell, (state, action) => {
      const { well, isSelected } = action.payload;

      state.selectedWellIds = {
        ...state.selectedWellIds,
        [well.id]: isSelected,
      };
      state.selectedWellboreIds = {
        ...state.selectedWellboreIds,
        ...getBooleanSelection(map(well.wellbores, 'id'), isSelected),
      };
    })
    .addCase(toggleSelectedWellboreOfWell, (state, action) => {
      const { well, wellboreId, isSelected } = action.payload;
      const { selectedWellIds, selectedWellboreIds } = state;

      set(selectedWellboreIds, wellboreId, isSelected);

      const isSomeWellboresSelected =
        isSelected ||
        well.wellbores?.some((wellbore) => selectedWellboreIds[wellbore.id]);

      set(selectedWellIds, well.id, isSelected || isSomeWellboresSelected);

      state.selectedWellIds = selectedWellIds;
      state.selectedWellboreIds = selectedWellboreIds;
    })
    .addCase(setColoredWellbores, (state, action) => {
      state.coloredWellbores = action.payload;
    })
    .addCase(setSelectedRelatedDocumentColumns, (state, action) => {
      const selectedRelatedDocumentsColumns = {
        ...state.selectedRelatedDocumentsColumns,
        ...action.payload,
      };
      state.selectedRelatedDocumentsColumns = selectedRelatedDocumentsColumns;
      storage.setItem(
        WELL_SELECTED_RELATED_DOCUMENTS_COLUMNS,
        selectedRelatedDocumentsColumns
      );
    })
    .addCase(stickChartHighlightEvent, (state, action) => {
      const { type, eventExternalId, isHighlighted } = action.payload;

      const stateKey = getHighlightedEventsStateKey(type);

      state.stickCharts = {
        ...state.stickCharts,
        [stateKey]: {
          ...state.stickCharts[stateKey],
          [eventExternalId]: isHighlighted,
        },
      };
    });
});

export const wellInspect = (
  state: WellInspectState | undefined,
  action: WellInspectAction
): WellInspectState => {
  return wellInspectReducerCreator(state, action);
};

export default wellInspect;
