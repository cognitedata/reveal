import { createReducer } from "@reduxjs/toolkit";
import Viewer from "@/UserInterface/NodeVisualizer/Viewers/Viewer";
import {
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS,
  SET_STATUS_PANEL_TEXT,
  SET_VISUALIZER_DATA,
  UPDATE_TOOLBARS
} from "@/UserInterface/Redux/actions/actionTypes";
import {VisualizerState} from "@/UserInterface/Redux/State/visualizer";

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
  [SET_VISUALIZER_DATA]: (state, action) =>
  {
    for (const viewer of action.payload.viewers as Viewer[])
    {
      const viewerName = viewer.getName();
      state.toolbars[viewerName] = viewer.getToolbar()!;
      state.targets[viewerName] = viewer.getTarget();
    }
  },

  [EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS]: (state, action) =>
  {
    const { visualizerId } = action.payload;
    const toolbar = state.toolbars[visualizerId];

    toolbar.map((item) =>
    {
      const command = item.command;
      item.isChecked = command.isChecked;
      item.icon = command.getIcon();
      item.isVisible = command.isVisible;
    });
  },

  [UPDATE_TOOLBARS]: (state, action) =>
  {
    for (const [, toolbar] of Object.entries(state.toolbars))
    {
      toolbar.map((item) =>
      {
        const command = item.command;
        item.isChecked = command.isChecked;
        item.icon = command.getIcon();
        item.isVisible = command.isVisible;
      });
    }
  },

  [SET_STATUS_PANEL_TEXT]: (state, action) =>
  {
    const { text } = action.payload;
    state.statusBar.text = text;
  }

});
