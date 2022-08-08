import { ExplorerState } from 'src/modules/Explorer/types';
import { explorerReducerInitialState } from 'src/modules/Explorer/store/slice';
import {
  processReducerInitialState,
  ProcessReducerState,
} from 'src/modules/Process/store/slice';
import { initialState as annotatorWrapperInitialState } from 'src/modules/Review/store/annotatorWrapper/slice';
import { AnnotatorWrapperState } from 'src/modules/Review/store/annotatorWrapper/type';
import { reviewReducerInitialState } from 'src/modules/Review/store/reviewSlice';
import { RootState } from 'src/store/rootReducer';
import sdk from '@cognite/cdf-sdk-singleton';
import { validatePersistedState } from 'src/utils/localStorage/validatePersistedState';
import { ReviewState } from 'src/modules/Review/store/review/types';

const VISION_STATE_NAME = 'visionState';
const OLD_VISION_STATE_NAME = 'state';

// To invalidate stored state when braking changes are added to the state
// bump up the version
export const APP_STATE_VERSION = 4;

const recoverOldState = () => {
  try {
    const serializedOldState = localStorage.getItem(OLD_VISION_STATE_NAME);
    if (serializedOldState) {
      const { stateMeta, ...persistedState } = JSON.parse(
        serializedOldState
      ) as OfflineState;
      if (
        validatePersistedState(stateMeta.project, stateMeta.appStateVersion)
      ) {
        saveState(persistedState);
        localStorage.removeItem(OLD_VISION_STATE_NAME);
      }
    }
  } catch (err) {
    console.error('Local storage state recover error', err);
  }
};

export const loadState = (): Partial<RootState> | undefined => {
  // recover state from local storage when state name has changed
  // and clean the old state saved in local storage
  recoverOldState();
  try {
    const serializedState = localStorage.getItem(VISION_STATE_NAME);
    if (serializedState) {
      const { stateMeta, ...persistedState } = JSON.parse(
        serializedState
      ) as OfflineState;
      if (
        validatePersistedState(stateMeta.project, stateMeta.appStateVersion)
      ) {
        return {
          annotatorWrapperReducer: {
            ...annotatorWrapperInitialState,
            ...persistedState.annotatorWrapperReducer,
          },
          reviewSlice: {
            ...reviewReducerInitialState,
            ...persistedState.reviewSlice,
          },
          explorerReducer: {
            ...explorerReducerInitialState,
            ...persistedState.explorerReducer,
          },
          processSlice: {
            ...processReducerInitialState,
            ...persistedState.processSlice,
          },
        };
      }
    }
    return {
      annotatorWrapperReducer: {
        ...annotatorWrapperInitialState,
      },
      reviewSlice: {
        ...reviewReducerInitialState,
      },
      explorerReducer: {
        ...explorerReducerInitialState,
      },
      processSlice: {
        ...processReducerInitialState,
      },
    };
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any): void => {
  try {
    const serializedState = JSON.stringify(getOfflineState(state));
    localStorage.setItem(VISION_STATE_NAME, serializedState);
  } catch (err) {
    console.error('Local storage state error', err);
  }
};

export type OfflineState = {
  annotatorWrapperReducer: Pick<AnnotatorWrapperState, 'predefinedAnnotations'>;
  reviewSlice: Pick<ReviewState, 'fileIds'>;
  explorerReducer: Pick<
    ExplorerState,
    'filter' | 'query' | 'sortMeta' | 'focusedFileId'
  >;
  processSlice: Pick<
    ProcessReducerState,
    | 'fileIds'
    | 'jobs'
    | 'files'
    | 'selectedDetectionModels'
    | 'availableDetectionModels'
  >;
  stateMeta: {
    project: string;
    appStateVersion: number;
  };
};

const getOfflineState = (state: RootState): OfflineState => {
  const offState: OfflineState = {
    annotatorWrapperReducer: {
      predefinedAnnotations:
        state.annotatorWrapperReducer.predefinedAnnotations,
    },
    reviewSlice: {
      fileIds: state.reviewSlice.fileIds,
    },
    explorerReducer: {
      filter: state.explorerReducer.filter,
      query: state.explorerReducer.query,
      sortMeta: state.explorerReducer.sortMeta,
      focusedFileId: state.explorerReducer.focusedFileId,
    },
    processSlice: {
      fileIds: state.processSlice.fileIds,
      jobs: state.processSlice.jobs,
      files: state.processSlice.files,
      selectedDetectionModels: state.processSlice.selectedDetectionModels,
      availableDetectionModels: state.processSlice.availableDetectionModels,
    },
    stateMeta: {
      project: sdk.project,
      appStateVersion: APP_STATE_VERSION,
    },
  };
  return offState;
};
