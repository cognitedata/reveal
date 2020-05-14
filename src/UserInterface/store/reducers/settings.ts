import { SettingsActionTypes, SettingsState } from "../types/settings";
import { IconTypes } from "../../constants/Icons";

// Initial settings state
const initialState: SettingsState = {
  id: "123sdffsdf^*&^Fdfs",
  titleBar: {
    name: "Random Polylines 1",
    icon: { type: IconTypes.NODES, name: "PolylinesNode" },
    toolBar: [
      {
        icon: { type: IconTypes.ACTIONS, name: "Clean" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatLeft" },
      },
      {
        icon: { type: IconTypes.ARROWS, name: "FatRight" },
      }
    ],
  }
};

// explorer reducer to update state with actions
export default (state = initialState, action: SettingsActionTypes) =>
{
  switch (action.payload)
  {
    default:
      return state;
  }
};

