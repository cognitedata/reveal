import { SET_FULLSCREEN_STATUS } from "@/UserInterface/redux/types/common";

export const setFullScreen = (payload: boolean) => {
    return { type: SET_FULLSCREEN_STATUS, payload };
};
