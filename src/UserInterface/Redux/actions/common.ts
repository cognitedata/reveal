import { SET_FULLSCREEN_STATUS } from "@/UserInterface/Redux/actions/actionTypes";

export const setFullScreen = (payload: boolean) =>
{
    return { type: SET_FULLSCREEN_STATUS, payload };
};
