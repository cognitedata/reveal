import {
  SettingsActionTypes,
  ON_EXPAND_CHANGE,
  ON_TEXT_INPUT_CHANGE,
  ON_SELECT_INPUT_CHANGE,
  ON_RANGE_INPUT_CHANGE,
  ON_COMPACT_COLOR_CHANGE,
  ON_EXPAND_CHANGE_FROM_TOOLBAR,
  GENERATE_SETTINGS_CONFIG,
  ON_CHANGE_SETTING_AVAILABILITY,
} from "../types/settings";

import { state1 } from "../../data/settings-dummy-state1";
import { state3 } from "../../data/settings-dummy-state3";

import { generateSettingsConfig } from "../../data/generateNodes";

// Initial settings state
const initialState = {};

// Settings reducer to update state with actions
export default (state = initialState, action: SettingsActionTypes) => {
  switch (action.type) {
    case ON_EXPAND_CHANGE: {
      const { sectionId, subSectionId } = action.payload;
      const section = state.sections[sectionId];
      if (subSectionId >= 0) {
        const subSection = section.subSections[subSectionId];
        subSection.isExpanded = !subSection.isExpanded;
      } else {
        section.isExpanded = !section.isExpanded;
      }
      return { ...state };
    }
    case ON_RANGE_INPUT_CHANGE:
    case ON_TEXT_INPUT_CHANGE:
    case ON_SELECT_INPUT_CHANGE: {
      const {
        sectionId,
        subSectionId,
        elementIndex,
        subElementIndex,
        value,
      } = action.payload;
      const section = state.sections[sectionId];
      let element = null;
      if (typeof subSectionId === "number")
        element = section.subSections[subSectionId].elements[elementIndex];
      else element = section.elements[elementIndex];
      if (typeof subElementIndex === "number")
        element.subElements[subElementIndex].value = value;
      else element.value = value;
      return { ...state };
    }
    case ON_CHANGE_SETTING_AVAILABILITY: {
      const { sectionId, subSectionId, elementIndex } = action.payload;
      const section = state.sections[sectionId];
      let element = null;
      if (subSectionId)
        element = section.subSections[subSectionId].elements[elementIndex];
      else element = section.elements[elementIndex];
      element.checked = !element.checked;
      return { ...state };
    }
    case ON_COMPACT_COLOR_CHANGE: {
      const { sectionId, subSectionId, elementIndex, value } = action.payload;
      const section = state.sections[sectionId];
      let element = null;
      if (typeof subSectionId === "number")
        element = section.subSections[subSectionId].elements[elementIndex];
      else element = section.elements[elementIndex];
      if (typeof subElementIndex === "number")
        element.subElements[subElementIndex].value = value;
      else element.value = value;
      return { ...state };
    }
    case ON_EXPAND_CHANGE_FROM_TOOLBAR: {
      const { sectionId, subSectionIndex, iconIndex } = action.payload;
      const section = state.sections[sectionId];
      const icon = section.toolBar[iconIndex];
      icon.selected = !icon.selected;
      const subSection = section.subSections[subSectionIndex];
      subSection.isExpanded = !subSection.isExpanded;
      return { ...state };
    }
    case GENERATE_SETTINGS_CONFIG: {
      if (action.payload) {
        const { node } = action.payload;
        const config = generateSettingsConfig(node);
        return { id: node.uniqueId.toString(), ...config };
      }
      return state;
    }
    default:
      return state;
  }
};
