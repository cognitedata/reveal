import { MiddlewareAPI, Dispatch } from "redux";
import { State } from "@/UserInterface/Redux/State/State";
import {
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND,
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS,
  SELECT_ON_CHANGE
} from "@/UserInterface/Redux/actions/actionTypes";
import { VisualizerState } from "@/UserInterface/Redux/State/visualizer";
import { BaseCommand } from "@/Core/Commands/BaseCommand";

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
      // A toolbar command is executed
      try
      {
        const { visualizerId, index } = payload;
        const command = getCommand(visualizers, visualizerId, index)
        command.invoke();
        // Command execution successful. Fire a new action
        const newAction = {
          type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS, payload: { visualizerId }
        };
        store.dispatch(newAction);
      }
      catch (err)
      {
        // tslint:disable-next-line: no-console
        console.error(err);
      }
      break;
    }
    case SELECT_ON_CHANGE:
    {
      // A toolbar select is changed
      try
      {
        const { visualizerId, index, event } = payload;
        const command = getCommand(visualizers, visualizerId, index)
        command.invokeValue(event.target.value);
        // Command execution successful. Fire a new action
        const newAction = {
          type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS, payload: { visualizerId }
        };
        store.dispatch(newAction);
      }
      catch (err)
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

function getCommand(visualizers: VisualizerState, visualizerId, index): BaseCommand
{
  return visualizers.toolbars[visualizerId][index].command;
}
