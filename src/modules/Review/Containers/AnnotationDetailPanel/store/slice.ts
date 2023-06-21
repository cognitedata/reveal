import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';

type AnnotationCategoryState = {
  [index in CDFAnnotationTypeEnum]?: { selected: boolean };
};

const initialAnnotationCategories: AnnotationCategoryState = {};

type State = {
  annotationCategories: AnnotationCategoryState;
};
const initialState: State = {
  annotationCategories: initialAnnotationCategories,
};

const annotationDetailPanelSlice = createSlice({
  name: 'annotationDetailPanelSlice',
  initialState,
  reducers: {
    selectAnnotationCategory(
      state,
      action: PayloadAction<{
        annotationType: CDFAnnotationTypeEnum;
        selected: boolean;
      }>
    ) {
      const { annotationType } = action.payload;
      if (annotationType) {
        /* eslint-disable no-param-reassign */
        if (action.payload.selected) {
          state.annotationCategories = {
            [annotationType]: {
              selected: action.payload.selected,
            },
          };
        } else if (state.annotationCategories[annotationType]) {
          delete state.annotationCategories[annotationType];
        }
        /* eslint-enable no-param-reassign */
      }
    },
  },
});

export type { State as AnnotationDetailPanelState };
export { initialState as annotationDetailPanelInitialState };

export const { selectAnnotationCategory } = annotationDetailPanelSlice.actions;

export default annotationDetailPanelSlice.reducer;
