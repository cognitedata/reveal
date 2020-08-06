import { createReducer } from "@reduxjs/toolkit";
import Viewer from "@/UserInterface/NodeVisualizer/Viewers/Viewer";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
import { VisualizerState } from "@/UserInterface/Redux/State/visualizer";

// Initial settings state
const initialState: VisualizerState = {
  toolbars: {},
  targets: {},
  statusBar: {
    text: ""
  }
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  [ActionTypes.setVisualizerData]: (state, action) =>
  {
    for (const viewer of action.payload.viewers as Viewer[])
    {
      const viewerName = viewer.getName();
      state.toolbars[viewerName] = viewer.getToolbar()!;
      state.targets[viewerName] = viewer.getTarget();
    }
  },

  [ActionTypes.executeVisualizerToolbarCommandSuccess]: (state, action) =>
  {
    const { visualizerId } = action.payload;
    const toolbar = state.toolbars[visualizerId];
    toolbar.map((item) =>
    {
      const { command } = item;
      item.isChecked = command.isChecked;
      item.icon = command.getIcon();
      item.isVisible = command.isVisible;
      item.isDropdown = command.isDropdown;
      item.value = command.value;
    });
  },

  [ActionTypes.setStatusPanelText]: (state, action) =>
  {
    const { text } = action.payload;
    state.statusBar.text = text;
  }
});
