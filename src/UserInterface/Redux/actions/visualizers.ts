import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";

export const setVisualizerData = (payload: any) =>
{
  return { type: ActionTypes.setVisualizerData, payload };
};

export const executeToolBarCommand = (payload: any) =>
{
  return { type: ActionTypes.executeVisualizerToolbarCommand, payload };
};

export const selectOnChange = (payload: any) =>
{
  return { type: ActionTypes.selectOnChange, payload};
};

export const updateStatusPanel = (payload: { text: string }) =>
{
  return { type: ActionTypes.setStatusPanelText, payload };
};
