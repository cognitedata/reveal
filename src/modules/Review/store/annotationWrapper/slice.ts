import { createSlice } from '@reduxjs/toolkit';
import { AnnotationWrapperState } from 'src/modules/Review/store/annotationWrapper/type';

export const initialState: AnnotationWrapperState = {
  predefinedAnnotations: {
    predefinedKeypoints: [],
    predefinedShapes: [],
  },
};

const annotationWrapperSlice = createSlice({
  name: 'annotationLabelSlice',
  initialState,
  reducers: {},
  // extraReducers: (builder) => {},
});

// eslint-disable-next-line no-empty-pattern
export const {} = annotationWrapperSlice.actions;

export default annotationWrapperSlice.reducer;
