import {
  TOGGLE_NODE_SELECT,
  TOGGLE_NODE_EXPAND,
  TOGGLE_NODE_CHECK,
  GENERATE_NODE_TREE,
  CHANGE_NODE_TYPE,
} from "../types/explorer";

import { ExplorerCommandPayloadType } from "../../interfaces/explorer";

// Explorer Actions

export const onToggleNodeSelect = (payload: ExplorerCommandPayloadType) => {
  return { type: TOGGLE_NODE_SELECT, payload };
};

export const onToggleNodeExpand = (payload: ExplorerCommandPayloadType) => {
  return { type: TOGGLE_NODE_EXPAND, payload };
};

export const onToggleNodeCheck = (payload: ExplorerCommandPayloadType) => {
  return { type: TOGGLE_NODE_CHECK, payload };
};

export const generateNodeTree = (payload: ExplorerCommandPayloadType) => {
  return { type: GENERATE_NODE_TREE, payload };
};

export const changeNodeType = (payload: ExplorerCommandPayloadType) => {
  return { type: CHANGE_NODE_TYPE, payload };
};
