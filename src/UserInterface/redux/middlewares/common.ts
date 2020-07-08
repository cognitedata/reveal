import { MiddlewareAPI, Dispatch } from 'redux';
import { ReduxStore } from '@/UserInterface/interfaces/common';
import { SET_FULLSCREEN_STATUS, SET_FULLSCREEN_STATUS_SUCCESS } from '@/UserInterface/redux/types/common';

// Common middleware
export default (store: MiddlewareAPI) => (next: Dispatch) => (action: {
    type: string;
    payload: any;
}) => {
    const state: ReduxStore = store.getState();
    const { visualizers } = state;
    const targetIds = Object.keys(visualizers.targets);
    const { type, payload } = action;
    switch (type) {
        case SET_FULLSCREEN_STATUS: {
            try {
                const newAction = {
                    type: SET_FULLSCREEN_STATUS_SUCCESS, payload: { isFullScreen:payload, targetIds, visualizers }
                };
                store.dispatch(newAction);
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(err);
            }
            break;
        }
        default:
            next(action);
    }
};
