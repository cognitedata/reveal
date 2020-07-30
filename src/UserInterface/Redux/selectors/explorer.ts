import { createSelector } from "reselect";
import { TreeDataItemState } from "@/UserInterface/Redux/State/explorer";
import { State } from "@/UserInterface/Redux/State/State";

// creating memoized, composable selector functions.
const getSelectedNodeIds = (state: State) =>
{
  const { tabs, selectedTabIndex } = state.explorer;
  if (tabs.length)
  {
    return tabs[selectedTabIndex].nodeIds;
  }
  return [];
};

const getNodes = (state: State) => state.explorer.nodes;

// Get filtered node list
const filterNodes = (nodes: { [key: string]: TreeDataItemState }, nodeIds: string[]) =>
{
  const filtered: { [key: string]: TreeDataItemState } = {};
  for (const id of nodeIds)
  {
    filtered[id] = nodes[id];
  }
  return filtered;
};

// select nodes based on node type
export const getVisibleNodes = createSelector(
  [getSelectedNodeIds, getNodes],
  (nodeIds, nodes) =>
  {
    if (nodes)
    {
      return filterNodes(nodes, nodeIds);
    }
    else
    {
      return;
    }
  }
);
