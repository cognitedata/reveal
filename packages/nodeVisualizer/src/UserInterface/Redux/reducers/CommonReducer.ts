import { createReducer } from "@reduxjs/toolkit";
import { ActionTypes } from "@/UserInterface/Redux/actions/ActionTypes";
import { ICommonState } from "@/UserInterface/Redux/State/common";

const initialState: ICommonState = {
  isFullscreen: false
};

export const commonReducer = createReducer(initialState, {
  [ActionTypes.setFullScreenStatus]: (state, action) => {
    state.isFullscreen = action.payload;
  }
});
