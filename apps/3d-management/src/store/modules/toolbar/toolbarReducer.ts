import {
  Actions,
  ToolbarState,
} from '@3d-management/store/modules/toolbar/types';

function getInitialState(): ToolbarState {
  return {
    ghostModeEnabled: false,
    nodePropertyFilter: { isLoading: false, value: null },
  };
}

export default function toolbarReducer(
  // eslint-disable-next-line default-param-last
  state: ToolbarState = getInitialState(),
  action: Actions
): ToolbarState {
  switch (action.type) {
    case 'toolbar/ghostModeUpdated': {
      return {
        ...state,
        ghostModeEnabled: action.payload,
      };
    }
    case 'toolbar/setNodePropertyFilterValue': {
      return {
        ...state,
        nodePropertyFilter: {
          ...state.nodePropertyFilter,
          value: action.payload,
        },
      };
    }
    case 'toolbar/setNodePropertyFilterLoadingState': {
      return {
        ...state,
        nodePropertyFilter: {
          ...state.nodePropertyFilter,
          isLoading: action.payload,
        },
      };
    }
  }
  return state;
}
