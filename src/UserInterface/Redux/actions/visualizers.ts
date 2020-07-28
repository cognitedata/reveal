import {
  SET_VISUALIZER_DATA,
  EXECUTE_VISUALIZER_TOOLBAR_COMMAND,
  SELECT_ON_CHANGE,
  SET_STATUS_PANEL_TEXT,
  UPDATE_TOOLBARS
} from "./actionTypes";

export const setVisualizerData = (payload: any) =>
{
  return { type: SET_VISUALIZER_DATA, payload };
};

export const executeToolBarCommand = (payload: any) =>
{
  return { type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND, payload };
};

export const selectOnChange = (payload: any) => 
{
  return { type: SELECT_ON_CHANGE, payload}
};

export const updateToolbars = () =>
{
  return { type: UPDATE_TOOLBARS };
};

export const updateStatusPanel = (payload: { text: string }) =>
{
  return { type: SET_STATUS_PANEL_TEXT, payload };
};

