import { MiddlewareAPI, Dispatch } from "redux";
import { ActionTypes } from "@/UserInterface/Redux/actions/ActionTypes";
import { ViewerUtils } from "@/UserInterface/NodeVisualizer/Viewers/ViewerUtils";

// TODO: Remove this middleware if possible
// Common middleware
export const NodeVisualizerMiddleware = (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: any;
}) =>
{
  const viewerList = Object.values(ViewerUtils.getViewers());
  const { type } = action;

  switch (type)
  {
    case ActionTypes.setFullScreenStatus:
    {
      try
      {
        next(action);
        for (const viewer of viewerList)
        {
          viewer.getTarget()?.onResize();
        }
      }
      catch (err)
      {
        console.error(err);
      }

      break;
    }
    default:
      next(action);
  }
};
