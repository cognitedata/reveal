import { TreeDataItem } from "../interfaces/explorer";
import { IconTypes } from "../constants/Icons";
import Nodes from "../constants/Nodes";

const names = ["Polylines Nodes", "Subsurface Nodes", "Well Nodes"];

export function generateData(numItems: number, parentIdx: number) {
  let data: { [key: string]: TreeDataItem } = {};
  function randomString() {
    return names[Math.floor(Math.random() * 2)];
  }

  function randomParent(dataLength: number) {
    const rnd = Math.floor(Math.random() * dataLength * parentIdx);
    if (rnd < 1) return undefined;
    return data[rnd].id;
  }
  for (let i = 0; i < numItems; i++) {
    const dataLength = Object.keys(data).length;
    const item = {
      type: "wells",
      id: i.toString(),
      name: randomString(),
      parentId: randomParent(dataLength),
      checked: false,
      disabled: false,
      expanded: false,
      icon: "ba8c2cf8d98eff705cf9c4d3236cda9a.png",
      iconDescription: "node",
      indeterminate: false,
      isFilter: false,
      isRadio: false,
      selected: false,
      visible: true,
      uniqueId: i.toString(),
    };
    data[i] = item;
  }
  return data;
}

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
