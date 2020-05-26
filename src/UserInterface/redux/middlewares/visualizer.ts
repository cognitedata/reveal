import { MiddlewareAPI, Dispatch } from "redux";
import { ReduxStore } from "../../interfaces/common";
import { ExplorerCommandPayloadType } from "../../interfaces/explorer";
import {
  VIEW_ALL_NODES,
  VIEW_ALL_NODES_SUCCESS,
  TOGGLE_NODE_CHECK_SUCCESS,
  TOGGLE_NODE_CHECK,
} from "../types/explorer";
import RootManager from "../../managers/rootManager";
import { BaseNode } from "@/Core/Nodes/BaseNode";

// Visualizer middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: ExplorerCommandPayloadType;
}) => {
  const { type, payload } = action;
  const state: ReduxStore = store.getState();
  const { explorer } = state;
  switch (type) {
    case VIEW_ALL_NODES: {
      try {
        const nodes = explorer.nodes;
        for (const id in nodes) {
          const node: BaseNode = nodes[id].domainObject!;
          node.setVisibleInteractive(true);
        }
        RootManager.viewNodes(payload.root!);
        const newAction = { type: VIEW_ALL_NODES_SUCCESS };
        store.dispatch(newAction);
      } catch (err) {}
      break;
    }
    case TOGGLE_NODE_CHECK: {
      try {
        const nodes = explorer.nodes;
        const { uniqueId } = action.payload;
        const node = nodes![uniqueId!].domainObject;
        if (node) {
          node.toggleVisibleInteractive();
          const newAction = { ...action, type: TOGGLE_NODE_CHECK_SUCCESS };
          store.dispatch(newAction);
        }
      } catch (err) {}
      break;
    }
    default:
      next(action);
  }
};
