import { SettingsActionTypes, SettingsState } from "../types/settings";
import { IconTypes } from "../../constants/Icons";
import { v4 as uuidv4 } from 'uuid';

import { ON_EXPAND_CHANGE } from "../types/settings"

// Initial settings state
const initialState = {
  id: uuidv4(),
  sections: {
    "section1": {
      name: "Random Polylines 1",
      icon: { type: IconTypes.NODES, name: "PolylinesNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        }
      ],
      subSections: {
        "subSection1": {
          name: "General Info",
          isExpanded: true,
        },
        "subSection2": {
          name: "Statistics",
          isExpanded: false,
        }
      }
    },
    "section2": {
      name: "Visual Settings",
      toolBar: [
        {
          icon: { type: IconTypes.ACTIONS, name: "Paste" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Reset" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Solution" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PointCloudNode" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PolylinesNode" },
        }
      ],
      subSections: {
        "subSection1": {
          name: "Lines",
          isExpanded: false,
        }
      }
    },
    "section3": {
      name: "New random Wells",
      icon: { type: IconTypes.NODES, name: "PolylinesNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        }
      ],
      subSections: {
        "subSection2": {
          name: "General Info",
          isExpanded: true,
        }
      }
    },
  },
};

// explorer reducer to update state with actions
export default (state = initialState, action: SettingsActionTypes) =>
{
  switch (action.type)
  {
    case ON_EXPAND_CHANGE:
      {
        const { main, sub } = action.payload;
        const subSection = state.sections[main].subSections[sub];
        subSection.isExpanded = !subSection.isExpanded;
        return { ...state };
      }
    default:
      return state;
  }
};

