import { createReducer } from "@reduxjs/toolkit";
import { CommonStateInterface } from "@/UserInterface/interfaces/common";
import { SET_FULLSCREEN_STATUS } from '@/UserInterface/redux/types/common';


const initialState: CommonStateInterface = {
    isFullscreen: false
};

export default createReducer(initialState, {
  [SET_FULLSCREEN_STATUS]: (state, action) => {
    state.isFullscreen = action.payload;
  }
});
