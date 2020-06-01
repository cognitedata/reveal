import { MiddlewareAPI, Dispatch } from "redux";
import { ReduxStore } from "../../interfaces/common";
import { ExplorerCommandPayloadType } from "../../interfaces/explorer";
import {
  TOGGLE_NODE_CHECK,
} from "../types/explorer";

// Visualizer middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: ExplorerCommandPayloadType;
}) => {
  const { type, payload } = action;
  const state: ReduxStore = store.getState();
  const { explorer } = state;
  switch (type) {
    case TOGGLE_NODE_CHECK: {
      try {
        const nodes = explorer.nodes;
        const { uniqueId } = payload;
        const node = nodes![uniqueId!].domainObject;
        if (node) {
          node.toggleVisibleInteractive();
          // const newAction = { ...action, type: TOGGLE_NODE_CHECK_SUCCESS };
          // store.dispatch(newAction);
        }
      } catch (err) { }
      break;
    }
    default:
      next(action);
  }
};
