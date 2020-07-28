import { createReducer } from "@reduxjs/toolkit";
import { SET_FULLSCREEN_STATUS } from "@/UserInterface/Redux/actions/actionTypes";
import {CommonState} from "@/UserInterface/Redux/State/common";

const initialState: CommonState = {
  isFullscreen: false
};

export default createReducer(initialState, {
  [SET_FULLSCREEN_STATUS]: (state, action) =>
  {
    state.isFullscreen = action.payload;
  }
});
