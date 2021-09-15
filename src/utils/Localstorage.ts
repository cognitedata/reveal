import {
  imagePreviewReducerInitialState,
  ImagePreviewReducerState,
} from 'src/modules/Review/imagePreviewSlice';
import { RootState } from 'src/store/rootReducer';
import {
  reviewReducerInitialState,
  ReviewReducerState,
} from 'src/modules/Review/previewSlice';

export const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState) {
      const persistedState = JSON.parse(serializedState) as OfflineState;
      return {
        imagePreviewReducer: {
          ...imagePreviewReducerInitialState,
          ...persistedState.imagePreviewReducer,
        },
        previewSlice: {
          ...reviewReducerInitialState,
          ...persistedState.previewSlice,
        },
      };
    }
    return {
      imagePreviewReducer: {
        ...imagePreviewReducerInitialState,
      },
      previewSlice: {
        ...reviewReducerInitialState,
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
  imagePreviewReducer: Pick<ImagePreviewReducerState, 'predefinedCollections'>;
  previewSlice: Pick<ReviewReducerState, 'fileIds'>;
};

const getOfflineState = (state: RootState): OfflineState => {
  const offState: OfflineState = {
    imagePreviewReducer: {
      predefinedCollections: state.imagePreviewReducer.predefinedCollections,
    },
    previewSlice: {
      fileIds: state.previewSlice.fileIds,
    },
  };
  return offState;
};
