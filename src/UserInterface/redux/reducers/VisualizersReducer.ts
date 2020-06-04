import { createReducer } from "@reduxjs/toolkit";
import { VisualizerStateInterface } from "@/UserInterface/interfaces/visualizers";
import ToolbarAdaptor from "@/UserInterface/adaptors/ToolbarAdaptor";

// Initial settings state
// TODO: Normalize state
const initialState: VisualizerStateInterface = {
    toolBars: {},
    targets: {},
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
    SET_VISUALIZER_DATA: (state, action) => {
        const { toolBars, targets } = action.payload;
        state.targets = targets;
        Object.keys(toolBars).forEach(viewerId => {
            state.toolBars[viewerId] = ToolbarAdaptor.convert(toolBars[viewerId].commands)
        })
    }, EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS: (state, action) => {
        const { icon, isChecked, visualizerId, index } = action.payload;
        state.toolBars[visualizerId][index].icon = icon;
        state.toolBars[visualizerId][index].isChecked = isChecked;
    }
});
