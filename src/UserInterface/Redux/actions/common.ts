import ActionTypes from "@/UserInterface/Redux/actions/ActionTypes";

export const setFullScreen = (payload: boolean) =>
{
  return { type: ActionTypes.setFullScreenStatus, payload };
};
