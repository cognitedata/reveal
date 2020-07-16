import { createSelector } from "reselect";
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { TreeDataItem } from "@/UserInterface/interfaces/explorer";

// creating memoized, composable selector functions.
const getSelectedNodeIds = (state: ReduxStore) =>
{
    const { tabs, selectedTabIndex } = state.explorer;
    if (tabs.length)
    {
        return tabs[selectedTabIndex].nodeIds;
    }
    return [];
};

const getNodes = (state: ReduxStore) => state.explorer.nodes;

// Get filtered node list
const filterNodes = (nodes: { [key: string]: TreeDataItem }, nodeIds: string[]) =>
{
    const filtered: { [key: string]: TreeDataItem } = {};
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
