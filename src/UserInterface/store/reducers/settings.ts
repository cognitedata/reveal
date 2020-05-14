import { SettingsActionTypes, ON_EXPAND_CHANGE, ON_TEXT_INPUT_CHANGE, ON_SELECT_CHANGE, ON_COMPACT_COLOR_CHANGE } from "../types/settings";
import { state1, state2 } from "../../data/settings-dummy-state"

// Initial settings state
const initialState = state1;

// Settings reducer to update state with actions
export default (state = initialState, action: SettingsActionTypes) =>
{
  switch (action.type)
  {
    case ON_EXPAND_CHANGE:
      {
        const { mainId, subIndex } = action.payload;
        const subSection = state.sections[mainId].subSections[subIndex];
        subSection.isExpanded = !subSection.isExpanded;
        return { ...state };
      }
    case ON_TEXT_INPUT_CHANGE:
      {
        const { mainId, subIndex, elementIndex, value } = action.payload;
        const element = state.sections[mainId].subSections[subIndex].elements[elementIndex];
        element.value = value;
        state.sections[mainId].subSections[subIndex].elements[elementIndex] = element;
        return { ...state }
      }
    case ON_SELECT_CHANGE:
      {
        const { mainId, subIndex, elementIndex, value } = action.payload;
        const element = state.sections[mainId].subSections[subIndex].elements[elementIndex];
        element.value = value;
        state.sections[mainId].subSections[subIndex].elements[elementIndex] = element;
        return { ...state }
      }
    case ON_COMPACT_COLOR_CHANGE:
      {
        const { mainId, subIndex, elementIndex, value } = action.payload;
        const element = state.sections[mainId].subSections[subIndex].elements[elementIndex];
        element.value = value;
        state.sections[mainId].subSections[subIndex].elements[elementIndex] = element;
        return { ...state }
      }
    case "CHANGE":
      return state2;
    default:
      return state;
  }
};

