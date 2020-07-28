import {
    CHANGE_SELECT_STATE,
    SET_FULLSCREEN_STATUS } from "@/UserInterface/Redux/actions/actionTypes";

export const setFullScreen = (payload: boolean) =>
{
    return { type: SET_FULLSCREEN_STATUS, payload };
};
export const changeSelectState = (appliesTo: string, payload: any) =>
{
    return { type: CHANGE_SELECT_STATE, appliesTo, payload };
};
