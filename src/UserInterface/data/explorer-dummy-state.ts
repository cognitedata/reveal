import { IconTypes } from "../constants/Icons";
import Nodes from "../constants/Nodes";

// Dummy tree state
export const state = {
  tabConfig: [
    {
      name: "Others",
      value: Nodes.NODE_TYPES.OTHERS,
      icon: {
        type: IconTypes.NODES,
        name: "FolderNode",
      },
    },
    {
      name: "Wells",
      value: Nodes.NODE_TYPES.WELLS,
      icon: {
        type: IconTypes.NODES,
        name: "WellNode",
      },
    },
    {
      name: "Seismic",
      value: Nodes.NODE_TYPES.SEISMIC,
      icon: {
        type: IconTypes.NODES,
        name: "PointsNode",
      },
    },
  ],
  selectedNodeType: null,
  selectedNode: null,
  checkedNodeIds: new Set<string>(),
  nodes: {},
};
