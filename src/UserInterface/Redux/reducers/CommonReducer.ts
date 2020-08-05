import { createReducer } from "@reduxjs/toolkit";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
import { CommonState } from "@/UserInterface/Redux/State/common";

const initialState: CommonState = {
  isFullscreen: false
};

export default createReducer(initialState, {
  [ActionTypes.setFullScreenStatus]: (state, action) =>
  {
    state.isFullscreen = action.payload;
  }
});
