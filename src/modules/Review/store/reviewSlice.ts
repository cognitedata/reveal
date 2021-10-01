import { FileInfo } from '@cognite/cdf-sdk-singleton';
import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { VisionAPIType } from 'src/api/types';
import { selectFileAnnotations } from 'src/modules/Common/store/annotationSlice';
import {
  clearFileState,
  deselectAllSelectionsReviewPage,
} from 'src/store/commonActions';
import { RootState } from 'src/store/rootReducer';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { createFileInfo } from 'src/store/util/StateUtils';
import {
  AnnotationStatus,
  KeypointVertex,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';

export interface VisibleAnnotation extends VisionAnnotation {
  show: boolean;
  selected: boolean;
}

type State = {
  fileIds: number[];
  selectedAnnotationIds: number[];
  hiddenAnnotationIds: number[];
  showCollectionSettings: boolean;
};

const initialState: State = {
  fileIds: [],
  selectedAnnotationIds: [],
  hiddenAnnotationIds: [],
  showCollectionSettings: false,
};

const reviewSlice = createSlice({
  name: 'reviewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setReviewFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    toggleAnnotationVisibility(
      state,
      action: PayloadAction<{
        annotationId: number;
      }>
    ) {
      const { annotationId } = action.payload;
      if (state.hiddenAnnotationIds.includes(annotationId)) {
        state.hiddenAnnotationIds = state.hiddenAnnotationIds.filter(
          (id) => id !== annotationId
        );
      } else {
        state.hiddenAnnotationIds.push(annotationId);
      }
    },
    selectAnnotation(state, action: PayloadAction<number>) {
      const annotationId = action.payload;
      state.selectedAnnotationIds = [annotationId];
    },
    showCollectionSettingsModel(state, action: PayloadAction<boolean>) {
      state.showCollectionSettings = action.payload;
    },
    resetPreview(state) {
      state.selectedAnnotationIds = [];
      state.hiddenAnnotationIds = [];
    },
    resetReviewPage(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      state.selectedAnnotationIds = [];
    });

    builder.addCase(DeleteAnnotations.fulfilled, (state, { payload }) => {
      state.selectedAnnotationIds = state.selectedAnnotationIds.filter(
        (id) => !payload.includes(id)
      );

      state.hiddenAnnotationIds = state.hiddenAnnotationIds.filter(
        (id) => !payload.includes(id)
      );
    });

    // Matchers

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, { payload }) => {
        // clear loaded Ids
        state.fileIds = state.fileIds.filter((id) => !payload.includes(id));
      }
    );
  },
});

export type { State as ReviewReducerState };
export { initialState as reviewReducerInitialState };

export const {
  setReviewFileIds,
  toggleAnnotationVisibility,
  selectAnnotation,
  showCollectionSettingsModel,
  resetPreview,
} = reviewSlice.actions;

export default reviewSlice.reducer;

// selectors

export const selectAllReviewFiles = createSelector(
  (state: RootState) => state.filesSlice.files.byId,
  (state: RootState) => state.reviewSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectVisibleAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    selectFileAnnotations(state.annotationReducer, fileId),
  (state: RootState) => state.reviewSlice.selectedAnnotationIds,
  (state: RootState) => state.reviewSlice.hiddenAnnotationIds,
  (state: RootState) => state.annotationLabelReducer.keypointMap.selectedIds,

  (
    fileAnnotations,
    selectedAnnotationIds,
    hiddenAnnotationIds,
    selectedKeypointIds
  ) => {
    return fileAnnotations
      .map((ann) => ({
        ...ann,
        show: !hiddenAnnotationIds.includes(ann.id),
        selected: selectedAnnotationIds.includes(ann.id),
      }))
      .map((ann: VisibleAnnotation) => {
        if (ann.data?.keypoint) {
          const keypoints = ann.region?.vertices.map((keypointVertex) => ({
            ...(keypointVertex as KeypointVertex),
            selected: selectedKeypointIds.includes(
              (keypointVertex as KeypointVertex).id
            ),
          }));

          return {
            ...ann,
            region: {
              vertices: keypoints as KeypointVertex[],
              shape: ann.region!.shape,
            },
          };
        }
        return ann;
      });
  }
);

export const selectTagAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    selectVisibleAnnotationsForFile(state, fileId),
  (allVisibleAnnotations) => {
    return allVisibleAnnotations.filter(
      (annotation) => annotation.modelType === VisionAPIType.TagDetection
    );
  }
);

export const selectOtherAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    selectVisibleAnnotationsForFile(state, fileId),
  (allVisibleAnnotations) => {
    return allVisibleAnnotations.filter(
      (ann) => ann.modelType !== VisionAPIType.TagDetection
    );
  }
);

export const selectVisibleNonRejectedAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    selectVisibleAnnotationsForFile(state, fileId),
  (allVisibleAnnotations) => {
    return allVisibleAnnotations.filter(
      (ann) =>
        ann.show && !!ann.region && ann.status !== AnnotationStatus.Rejected
    );
  }
);
