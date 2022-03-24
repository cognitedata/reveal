import { FileInfo } from '@cognite/sdk';

export type DiagramsReducerState = {
  files: FileInfo[];
  selectedExternalIds: string[];
  currentIndex: number;
  showList: boolean;
};

export enum DiagramsReducerActionTypes {
  SET_DIAGRAMS,
  NEXT,
  PREVIOUS,
  TOGGLE_SHOW_LIST,
  SET_SELECTION_FOR_PARSING,
}

export type DiagramsReducerAction =
  | { type: DiagramsReducerActionTypes.SET_DIAGRAMS; diagrams: FileInfo[] }
  | {
      type: DiagramsReducerActionTypes.SET_SELECTION_FOR_PARSING;
      externalIds: string[];
    }
  | { type: DiagramsReducerActionTypes.NEXT }
  | { type: DiagramsReducerActionTypes.PREVIOUS }
  | { type: DiagramsReducerActionTypes.TOGGLE_SHOW_LIST };

export const initialState: DiagramsReducerState = {
  files: [],
  selectedExternalIds: [],
  currentIndex: 0,
  showList: false,
};

const diagramsReducer = (
  state: DiagramsReducerState,
  action: DiagramsReducerAction
): DiagramsReducerState => {
  switch (action.type) {
    case DiagramsReducerActionTypes.TOGGLE_SHOW_LIST: {
      return { ...state, showList: !state.showList };
    }
    case DiagramsReducerActionTypes.SET_DIAGRAMS: {
      return { ...state, files: action.diagrams };
    }
    case DiagramsReducerActionTypes.NEXT: {
      const newIndex = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: newIndex,
      };
    }
    case DiagramsReducerActionTypes.PREVIOUS: {
      const newIndex = state.currentIndex - 1;
      return {
        ...state,
        currentIndex: newIndex,
      };
    }
    case DiagramsReducerActionTypes.SET_SELECTION_FOR_PARSING: {
      return {
        ...state,
        selectedExternalIds: action.externalIds,
        currentIndex: 0,
      };
    }
    default:
      return state;
  }
};

export default diagramsReducer;
