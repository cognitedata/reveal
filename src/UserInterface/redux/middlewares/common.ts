import { MiddlewareAPI, Dispatch } from "redux";
import { ReduxStore } from "@/UserInterface/interfaces/common";
import { SET_FULLSCREEN_STATUS } from "@/UserInterface/redux/types/actionTypes";

// Common middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: any;
}) =>
{
  const state: ReduxStore = store.getState();
  const { visualizers } = state;
  const targetIds = Object.keys(visualizers.targets);
  const { type, payload } = action;

  switch (type)
  {
    case SET_FULLSCREEN_STATUS:
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
