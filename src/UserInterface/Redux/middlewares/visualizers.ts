import { MiddlewareAPI, Dispatch } from "redux";
import { State } from "@/UserInterface/Redux/State/State";
import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";
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
    case ActionTypes.executeVisualizerToolbarCommand:
    {
      // A toolbar command is executed
      try
      {
        const { visualizerId, index } = payload;
        const command = getCommand(visualizers, visualizerId, index);
        command.invoke();
        // Command execution successful. Fire a new action
        const newAction = {
          type: ActionTypes.executeVisualizerToolbarCommandSuccess, payload: { visualizerId }
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
    case ActionTypes.selectOnChange:
    {
      // A toolbar select is changed
      try
      {
        const { visualizerId, index, event } = payload;
        const command = getCommand(visualizers, visualizerId, index);
        command.invokeValue(event.target.value);
        // Command execution successful. Fire a new action
        const newAction = {
          type: ActionTypes.executeVisualizerToolbarCommandSuccess, payload: { visualizerId }
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
