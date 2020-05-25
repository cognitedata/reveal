import { TreeDataItem } from "../interfaces/explorer";
import { IconTypes } from "../constants/Icons";

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
      id: i.toString(),
      name: randomString(),
      parentId: randomParent(dataLength),
      checked: false,
      disabled: false,
      expanded: false,
      icon: { type: IconTypes.NODES, name: "PointsNode" },
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
  selectedNode: null,
  checkedNodeIds: new Set<string>(),
  nodes: generateData(500, 0.9),
};
