import { createReducer } from "@reduxjs/toolkit";
import { VisualizerStateInterface } from "@/UserInterface/interfaces/visualizers";
import ToolbarAdaptor from "@/UserInterface/adaptors/ToolbarAdaptor";

// Initial settings state
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
        const { visualizerId } = action.payload;
        const toolbar = state.toolBars[visualizerId];
        toolbar.map((item) => {
            const command = item.command;
            item.isChecked = command.isChecked;
            item.icon = command.getIcon();
        });
    }
});
