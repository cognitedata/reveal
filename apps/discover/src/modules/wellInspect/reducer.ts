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
  getInitialSelectedRelatedDocumentsColumns,
} from './utils';

export const initialState: WellInspectState = {
  selectedWellIds: {},
  selectedWellboreIds: {},
  goBackNavigationPath: navigation.SEARCH_WELLS,
  coloredWellbores: false,
  selectedRelatedDocumentsColumns: getInitialSelectedRelatedDocumentsColumns(),
  wellFeedback: { visible: false },
};

const {
  setPrerequisiteData,
  setGoBackNavigationPath,
  toggleSelectedWell,
  toggleSelectedWellboreOfWell,
  setColoredWellbores,
  setSelectedRelatedDocumentColumns,
  setWellFeedback,
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
    .addCase(setWellFeedback, (state, action) => {
      if (action.payload.visible) {
        state.wellFeedback = action.payload;
      } else {
        state.wellFeedback = {
          visible: action.payload.visible,
          wellboreMatchingId: undefined,
          dataSet: undefined,
        };
      }
    });
});

export const wellInspect = (
  state: WellInspectState | undefined,
  action: WellInspectAction
): WellInspectState => {
  return wellInspectReducerCreator(state, action);
};

export default wellInspect;
