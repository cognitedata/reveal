import { MiddlewareAPI, Dispatch } from "redux";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
import { State } from "@/UserInterface/Redux/State/State";

// Common middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: any;
}) =>
{
  const state: State = store.getState();
  const { visualizers } = state;
  const targetIds = Object.keys(visualizers.targets);
  const { type } = action;

  switch (type)
  {
    case ActionTypes.setFullScreenStatus:
    {
      try
      {
        next(action);
        for (const id of targetIds)
        {
          visualizers.targets[id].onResize();
        }
      } catch (err)
      {
        // tslint:disable-next-line: no-console
        console.error(err);
      }
      break;
    }
    default:
      next(action);
  }
};
