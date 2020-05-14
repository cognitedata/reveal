import { SettingsActionTypes } from "../types/settings";

// Initial settings state
const initialState = {
  id: "123sdffsdf^*&^Fdfs",
  titleBar: {
    name: "Franke few",
    icon: "polyline.png",
  },
  toolBar: [
    {
      icon: "pin.png",
      action: null
    },
    {
      icon: "left-arrow.png",
      action: null
    }
  ],
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

