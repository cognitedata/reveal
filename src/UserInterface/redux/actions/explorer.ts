import {
  ON_TOGGLE_NODE_SELECT,
  ON_TOGGLE_NODE_EXPAND,
  ON_TOGGLE_NODE_CHECK,
} from "../types/explorer";

import { ExplorerCommandPayloadType } from "../../interfaces/explorer";

// Explorer Actions

export const onToggleNodeSelect = (payload: ExplorerCommandPayloadType) => {
  return { type: ON_TOGGLE_NODE_SELECT, payload };
};

export const onToggleNodeExpand = (payload: ExplorerCommandPayloadType) => {
  return { type: ON_TOGGLE_NODE_EXPAND, payload };
};

export const onToggleNodeCheck = (payload: ExplorerCommandPayloadType) => {
  return { type: ON_TOGGLE_NODE_CHECK, payload };
};
