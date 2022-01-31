import { ExplorerState } from 'src/modules/Explorer/types';
import { explorerReducerInitialState } from 'src/modules/Explorer/store/slice';
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
    'predefinedAnnotations'
  >;
  reviewSlice: Pick<ReviewReducerState, 'fileIds'>;
  explorerSlice: Pick<
    ExplorerState,
    'filter' | 'query' | 'sortMeta' | 'focusedFileId'
  >;
};

const getOfflineState = (state: RootState): OfflineState => {
  const offState: OfflineState = {
    annotationLabelReducer: {
      predefinedAnnotations: state.annotationLabelReducer.predefinedAnnotations,
    },
    reviewSlice: {
      fileIds: state.reviewSlice.fileIds,
    },
    explorerSlice: {
      filter: state.explorerReducer.filter,
      query: state.explorerReducer.query,
      sortMeta: state.explorerReducer.sortMeta,
      focusedFileId: state.explorerReducer.focusedFileId,
    },
  };
  return offState;
};
