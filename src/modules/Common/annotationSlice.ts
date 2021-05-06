import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Annotation } from 'src/api/types';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { createSelector } from 'reselect';
import { AnnotationCounts, AnnotationsBadgeCounts } from './types';

type State = {
  byId: Record<
    number,
    [Pick<Annotation, 'id' | 'annotationType' | 'source' | 'status' | 'text'>]
  >;
};

const initialState: State = {
  byId: {},
};
const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {},
  /* eslint-disable no-param-reassign */
  extraReducers: (builder) => {
    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (state: State, { payload: annotations }: PayloadAction<Annotation[]>) => {
        annotations.forEach((item: Annotation) => {
          const recordValue = {
            id: item.id,
            annotationType: item.annotationType,
            source: item.source,
            status: item.status,
            text: item.text,
          };
          if (!state.byId[item.annotatedResourceId]) {
            state.byId[item.annotatedResourceId] = [recordValue];
          } else {
            state.byId[item.annotatedResourceId].push(recordValue);
          }
        });
      }
    );
  },
});

export default annotationSlice.reducer;

// selectors
export const makeGetAnnotationCounts = () =>
  createSelector(
    (state: State, id: number) => state.byId[id],
    (annotations) => {
      const annotationsBadgeProps: AnnotationsBadgeCounts = {
        tag: {},
        gdpr: {},
        text: {},
        objects: {},
      };

      if (annotations) {
        annotations.forEach((item) => {
          if (item.annotationType === 'vision/ocr') {
            annotationsBadgeProps.text = getSingleAnnotationCounts(item);
          }
          if (item.annotationType === 'vision/tagdetection') {
            annotationsBadgeProps.tag = getSingleAnnotationCounts(item);
          }
          if (item.annotationType === 'vision/objectdetection') {
            if (item.text === 'person') {
              annotationsBadgeProps.gdpr = getSingleAnnotationCounts(item);
            } else {
              annotationsBadgeProps.objects = getSingleAnnotationCounts(item);
            }
          }
        });
      }
      return annotationsBadgeProps;
    }
  );

// helper functions
const getSingleAnnotationCounts = (
  annotation: Pick<
    Annotation,
    'id' | 'annotationType' | 'source' | 'status' | 'text'
  >
) => {
  let [modelGenerated, manuallyGenerated, verified, unhandled, rejected] = [
    0,
    0,
    0,
    0,
    0,
  ];
  if (annotation.source === 'user') {
    manuallyGenerated++;
  } else {
    modelGenerated++;
  }
  if (annotation.status === AnnotationStatus.Verified) {
    verified++;
  }
  if (annotation.status === AnnotationStatus.Unhandled) {
    unhandled++;
  }
  if (annotation.status === AnnotationStatus.Rejected) {
    rejected++;
  }

  return {
    modelGenerated,
    manuallyGenerated,
    verified,
    unhandled,
    rejected,
  } as AnnotationCounts;
};
