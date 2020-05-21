import { createReducer } from "@reduxjs/toolkit";

import {} from "../types/settings";
import { SettingsStateInterface } from "../../interfaces/settings";
import { state } from "../../data/settings-dummy-state";

// Initial settings state
const initialState: SettingsStateInterface = state;

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  ON_EXPAND_CHANGE: (state, action) => {
    const { sectionId, subSectionId, expandState } = action.payload;
    if (subSectionId) {
      const subSection = state.subSections[subSectionId];
      const { iconIndex } = subSection;
      if (iconIndex) {
        const section = state.sections[sectionId];
        if (section.toolBar) section.toolBar[iconIndex].selected = expandState;
      }
      subSection.isExpanded = expandState;
    } else {
      state.sections[sectionId].isExpanded = expandState;
    }
  },
  ON_INPUT_CHANGE: (state, action) => {
    const { elementIndex, subElementIndex, value } = action.payload;
    if (elementIndex) {
      state.elements[elementIndex].value = value;
    } else {
      state.subElements[subElementIndex].value = value;
    }
  },
  ON_CHANGE_SETTING_AVAILABILITY: (state, action) => {
    const { elementIndex, value } = action.payload;
    state.elements[elementIndex].checked = value;
  },
  ON_EXPAND_CHANGE_FROM_TOOLBAR: (state, action) => {
    const { sectionId, subSectionId, iconIndex } = action.payload;
    const section = state.sections[sectionId!];
    const icon = section.toolBar![iconIndex!];
    const expandState = state.subSections[subSectionId].isExpanded;
    icon.selected = !expandState;
    state.subSections[subSectionId].isExpanded = !expandState;
  },
});
