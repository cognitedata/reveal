import { createReducer } from "@reduxjs/toolkit";

import { ExplorerStateInterface } from "../../interfaces/explorer";
import { state } from "../../data/explorer-dummy-state";

const initialState: ExplorerStateInterface = state;

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
  ON_TOGGLE_NODE_SELECT: (state, action) => {
    const { uniqueId, selectState } = action.payload;
    state.nodes![uniqueId].selected = selectState;
    if (selectState) {
      if (state.selectedNode) state.nodes![state.selectedNode].selected = false;
      state.selectedNode = uniqueId;
    }
  },
  ON_TOGGLE_NODE_EXPAND: (state, action) => {
    const { uniqueId, expandState } = action.payload;
    state.nodes![uniqueId].expanded = expandState;
  },
  ON_TOGGLE_NODE_CHECK: (state, action) => {
    const { uniqueId, checkState } = action.payload;
    state.nodes![uniqueId].checked = checkState;
    if (checkState) state.checkedNodeIds.add(uniqueId);
  },
});
