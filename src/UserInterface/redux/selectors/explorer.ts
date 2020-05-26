import { createSelector } from "reselect";

import { ReduxStore } from "../../interfaces/common";
import { TreeDataItem } from "../../interfaces/explorer";

// creating memoized, composable selector functions.
const getNodeFilter = (state: ReduxStore) => state.explorer.selectedNodeType;
const getNodes = (state: ReduxStore) => state.explorer.nodes;

// Get filtered node list
const filterNodes = (nodes: { [key: string]: TreeDataItem }, type: string) => {
  const filtered: { [key: string]: TreeDataItem } = {};
  for (const id in nodes) {
    if (nodes[id].type === type) {
      filtered[id] = nodes[id];
    }
  }
  return filtered;
};

// select nodes based on node type
export const getVisibleNodes = createSelector(
  [getNodeFilter, getNodes],
  (nodesFilter, nodes) => {
    if (nodes) {
      return filterNodes(nodes, nodesFilter.name);
    } else {
      return;
    }
  }
);
