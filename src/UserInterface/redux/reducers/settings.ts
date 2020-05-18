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

import { generateSettingsConfig } from "../../data/generateNodes";

// Initial settings state
const initialState = {
  id: null,
  sections: null,
};

// Settings reducer to update state with actions
export default (state = initialState, action: SettingsActionTypes) => {
  switch (action.type) {
    case ON_EXPAND_CHANGE: {
      const { mainId, subIndex, iconIndex } = action.payload;
      const section = state.sections[mainId];
      const subSection = section.subSections[subIndex];
      if (iconIndex) {
        const icon = section.toolBar[iconIndex].icon;
        icon.selected = !icon.selected;
      }
      subSection.isExpanded = !subSection.isExpanded;
      return { ...state };
    }
    case ON_RANGE_INPUT_CHANGE:
    case ON_TEXT_INPUT_CHANGE:
    case ON_SELECT_INPUT_CHANGE: {
      const {
        mainId,
        subIndex,
        elementIndex,
        subElementIndex,
        value,
      } = action.payload;
      const element =
        state.sections[mainId].subSections[subIndex].elements[elementIndex];
      if (subElementIndex === 0 || subElementIndex)
        element.subElements[subElementIndex].value = value;
      else element.value = value;
      return { ...state };
    }
    case ON_CHANGE_SETTING_AVAILABILITY: {
      const { mainId, subIndex, elementIndex } = action.payload;
      const element =
        state.sections[mainId].subSections[subIndex].elements[elementIndex];
      element.checked = !element.checked;
      return { ...state };
    }
    case ON_COMPACT_COLOR_CHANGE: {
      const { mainId, subIndex, elementIndex, value } = action.payload;
      const element =
        state.sections[mainId].subSections[subIndex].elements[elementIndex];
      element.value = value;
      return { ...state };
    }
    case ON_EXPAND_CHANGE_FROM_TOOLBAR: {
      const { sectionId, subSectionIndex, iconIndex } = action.payload;
      const section = state.sections[sectionId];
      const icon = section.toolBar[iconIndex].icon;
      const subSection = section.subSections[subSectionIndex];
      icon.selected = !icon.selected;
      subSection.isExpanded = !subSection.isExpanded;
      return { ...state };
    }
    case GENERATE_SETTINGS_CONFIG: {
      if (action.payload) {
        const { node } = action.payload;
        const config = generateSettingsConfig(node);
        return { ...state, id: node.uniqueId.toString(), sections: config };
      }
      return state;
    }
    default:
      return state;
  }
};
