import {
    SET_VISUALIZER_DATA, EXECUTE_VISUALIZER_TOOLBAR_COMMAND,
} from "../types/visualizers";

export const setVisualizerData = (payload: any) => {
    return { type: SET_VISUALIZER_DATA, payload }
};

export const executeToolBarCommand = (payload: any) => {
    return { type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND, payload }
};
