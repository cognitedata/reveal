import {
  GhostModeUpdated,
  ToolbarState,
} from 'src/store/modules/toolbar/types';
import { Dispatch } from 'redux';
import { RootState } from 'src/store';

export default function toolbarReducer(
  state: ToolbarState = { ghostModeEnabled: false },
  action: { type: string; payload: boolean }
) {
  switch (action.type) {
    case 'toolbar/ghostModeUpdated': {
      return {
        ...state,
        ghostModeEnabled: action.payload,
      };
    }
  }
  return state;
}

export const toggleGhostMode = (isEnabled?: boolean) => (
  dispatch: Dispatch<GhostModeUpdated>,
  getState: () => RootState
) => {
  const { ghostModeEnabled } = getState().toolbar;
  dispatch({
    type: 'toolbar/ghostModeUpdated',
    payload: typeof isEnabled === 'undefined' ? !ghostModeEnabled : isEnabled,
  });
};
