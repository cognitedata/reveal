import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

import {
  clearFileState,
  deselectAllSelectionsReviewPage,
} from '../../../../store/commonActions';
import { DeleteAnnotations } from '../../../../store/thunks/Annotation/DeleteAnnotations';
import { DeleteFilesById } from '../../../../store/thunks/Files/DeleteFilesById';

import { AnnotationSettingsOption } from './enums';
import { ReviewState } from './types';

export const initialState: ReviewState = {
  fileIds: [],
  selectedAnnotationIds: [],
  hiddenAnnotationIds: [],
  annotationSettings: {
    show: false,
    activeView: AnnotationSettingsOption.SHAPE,
    createNew: {
      text: undefined,
      color: undefined,
    },
  },
  scrollToId: '',
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
    showAnnotationSettingsModel: {
      prepare: (
        show: boolean,
        type = AnnotationSettingsOption.SHAPE,
        text?: string,
        color?: string
      ) => {
        return {
          payload: {
            show,
            options: { type, text, color },
          },
        };
      },
      reducer: (
        state,
        action: PayloadAction<{
          show: boolean;
          options: {
            type: AnnotationSettingsOption;
            text?: string;
            color?: string;
          };
        }>
      ) => {
        state.annotationSettings.createNew.text = action.payload.options?.text;
        state.annotationSettings.createNew.color =
          action.payload.options?.color;
        state.annotationSettings.activeView = action.payload.options.type;
        state.annotationSettings.show = action.payload.show;
      },
    },
    setScrollToId(state, action: PayloadAction<string>) {
      state.scrollToId = action.payload;
    },
    resetPreview(state) {
      state.selectedAnnotationIds = [];
      state.hiddenAnnotationIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      state.selectedAnnotationIds = [];
      state.scrollToId = '';
    });

    builder.addCase(DeleteAnnotations.fulfilled, (state, { meta: { arg } }) => {
      state.selectedAnnotationIds = state.selectedAnnotationIds.filter(
        (id) => !arg.map((internalId) => internalId.id).includes(id)
      );

      state.hiddenAnnotationIds = state.hiddenAnnotationIds.filter(
        (id) => !arg.map((internalId) => internalId.id).includes(id)
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

export const {
  setReviewFileIds,
  toggleAnnotationVisibility,
  selectAnnotation,
  showAnnotationSettingsModel,
  setScrollToId,
  resetPreview,
} = reviewSlice.actions;

export default reviewSlice.reducer;
