import { MiddlewareAPI, Dispatch } from "redux";
import { ReduxStore } from "../../interfaces/common";
import { ExplorerCommandPayloadType } from "../../interfaces/explorer";
import { TOGGLE_NODE_CHECK, TOGGLE_NODE_SELECT } from "../types/actionTypes";

// Explorer middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: ExplorerCommandPayloadType;
}) =>
{
  const { type, payload } = action;
  const state: ReduxStore = store.getState();
  const { explorer } = state;
  switch (type)
  {
    case TOGGLE_NODE_CHECK:
    {
      try
      {
        const nodes = explorer.nodes;
        const { uniqueId } = payload;
        const node = nodes![uniqueId!].domainObject;
        if (node)
        {
          node.toggleVisibleInteractive();
          // const newAction = { ...action, type: TOGGLE_NODE_CHECK_SUCCESS };
          // store.dispatch(newAction);
        }
      } catch (err)
      {}
      break;
    }
    case TOGGLE_NODE_SELECT:
    {
      try
      {
        const nodes = explorer.nodes;
        const { uniqueId, selectState } = payload;
        const node = nodes![uniqueId!].domainObject;
        if (node?.canBeSelected())
        {
          if (selectState && explorer.selectedNode)
          {
            const currentSelectedNode = nodes![explorer.selectedNode].domainObject;
            currentSelectedNode?.SetSelectedInteractive(!selectState);
          }
          node?.SetSelectedInteractive(selectState!);
        }
      } catch (err)
      {
        // tslint:disable-next-line: no-console
        console.log("Error Generating Settings State", err);
      }
      break;
    }
    default:
      next(action);
  }
};
