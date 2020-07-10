import { SET_FULLSCREEN_STATUS } from "@/UserInterface/redux/types/common";

export const setFullScreeen = (payload: boolean) => {
  return { type: SET_FULLSCREEN_STATUS, payload };
}
