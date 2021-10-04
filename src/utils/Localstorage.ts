import {
  explorerReducerInitialState,
  ExplorerReducerState,
} from 'src/modules/Explorer/store/explorerSlice';
import {
  annotationLabelReducerInitialState,
  AnnotationLabelReducerState,
} from 'src/modules/Review/store/annotationLabelSlice';
import {
  reviewReducerInitialState,
  ReviewReducerState,
} from 'src/modules/Review/store/reviewSlice';

import { RootState } from 'src/store/rootReducer';

export const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState) {
      const persistedState = JSON.parse(serializedState) as OfflineState;
      return {
        annotationLabelReducer: {
          ...annotationLabelReducerInitialState,
          ...persistedState.annotationLabelReducer,
        },
        reviewSlice: {
          ...reviewReducerInitialState,
          ...persistedState.reviewSlice,
        },
        explorerReducer: {
          ...explorerReducerInitialState,
          ...persistedState.explorerSlice,
        },
      };
    }
    return {
      annotationLabelReducer: {
        ...annotationLabelReducerInitialState,
      },
      reviewSlice: {
        ...reviewReducerInitialState,
      },
      explorerReducer: {
        ...explorerReducerInitialState,
      },
    };
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any): void => {
  try {
    const serializedState = JSON.stringify(getOfflineState(state));
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('Localstorage state error', err);
  }
};

export type OfflineState = {
  annotationLabelReducer: Pick<
    AnnotationLabelReducerState,
    'predefinedCollections'
  >;
  reviewSlice: Pick<ReviewReducerState, 'fileIds'>;
  explorerSlice: Pick<
    ExplorerReducerState,
    'filter' | 'query' | 'sortPaginate' | 'focusedFileId'
  >;
};

const getOfflineState = (state: RootState): OfflineState => {
  const offState: OfflineState = {
    annotationLabelReducer: {
      predefinedCollections: state.annotationLabelReducer.predefinedCollections,
    },
    reviewSlice: {
      fileIds: state.reviewSlice.fileIds,
    },
    explorerSlice: {
      filter: state.explorerReducer.filter,
      query: state.explorerReducer.query,
      sortPaginate: state.explorerReducer.sortPaginate,
      focusedFileId: state.explorerReducer.focusedFileId,
    },
  };
  return offState;
};
