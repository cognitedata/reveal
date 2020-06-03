import { createReducer } from "@reduxjs/toolkit";
import { VisualizerStateInterface } from "@/UserInterface/interfaces/visualizers";
import ToolbarAdaptor from "@/UserInterface/adaptors/ToolbarAdaptor";

// Initial settings state
// TODO: Normalize state
const initialState: VisualizerStateInterface = {
    toolBars: {},
    noOfCommands: 0
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
    SET_VISUALIZER_TOOLBARS: (state, action) => {
        const { id, toolBar } = action.payload;
        if (toolBar.commands) {
            state.noOfCommands += Object.keys(toolBar.commands).length;
            state.toolBars[id] = ToolbarAdaptor.convert(toolBar.commands);
        }
    }, EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS: (state, action) => {
        const { icon, isChecked, visualizerId, commandType, index } = action.payload;
        state.toolBars[visualizerId][commandType][index].icon = icon;
        state.toolBars[visualizerId][commandType][index].isChecked = isChecked;
    }
});
