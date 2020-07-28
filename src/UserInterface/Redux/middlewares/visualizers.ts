import { MiddlewareAPI, Dispatch } from "redux";
import {State} from "@/UserInterface/Redux/State/State";
import {
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND,
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS
} from "@/UserInterface/Redux/actions/actionTypes";

// Visualizer middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
  type: string;
  payload: any;
}) =>
{
  const state: State = store.getState();
  const { visualizers } = state;
  const { type, payload } = action;
  switch (type)
  {
    case EXECUTE_VISUALIZER_TOOLBAR_COMMAND:
    {
      // A toolbar commad is executed
      try
      {
        const { visualizerId, index } = payload;
        const { command } = visualizers.toolbars[visualizerId][index];
        if (command.invoke)
        {
          // Has command definition and execute it
          command.invoke();
          // Commad execution successful. Fire a new action
          const newAction = {
            type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS, payload: { visualizerId }
          };
          store.dispatch(newAction);
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
