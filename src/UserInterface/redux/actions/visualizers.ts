import {
    SET_VISUALIZER_TOOLBARS, EXECUTE_VISUALIZER_TOOLBAR_COMMAND,
} from "../types/visualizers";

export const setVisualizerToolbars = (payload: any) => {
    return { type: SET_VISUALIZER_TOOLBARS, payload }
};

export const executeToolBarCommand = (payload: any) => {
    return { type: EXECUTE_VISUALIZER_TOOLBAR_COMMAND, payload }
};
