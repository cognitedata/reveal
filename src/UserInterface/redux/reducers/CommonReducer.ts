import { createReducer } from "@reduxjs/toolkit";
import { CommonStateInterface } from "@/UserInterface/interfaces/common";
import { SET_FULLSCREEN_STATUS_SUCCESS } from '@/UserInterface/redux/types/common';


const initialState: CommonStateInterface = {
    isFullscreen: false
};

export default createReducer(initialState, {
    [SET_FULLSCREEN_STATUS_SUCCESS]: (state, action) => {
        state.isFullscreen = action.payload.isFullScreen;
        for (const id of action.payload.targetIds) {
            action.payload.visualizers.targets[id].onResize();
        }
    }
});
