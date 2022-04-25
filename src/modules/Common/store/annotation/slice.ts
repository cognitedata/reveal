import { createSlice } from '@reduxjs/toolkit';
import { convertCDFAnnotationV1ToVisionAnnotationBulk } from 'src/api/annotation/bulkConverters';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { VisionAnnotationV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { getAnnotatedResourceId } from 'src/modules/Common/Utils/getAnnotatedResourceId/getAnnotatedResourceId';

export const initialState: AnnotationState = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
};

const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {},
  /* eslint-disable no-param-reassign */
  extraReducers: (builder) => {
    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (
        state: AnnotationState,
        {
          payload,
          meta,
        }: {
          payload: VisionAnnotationV1[];
          meta: {
            arg: {
              fileIds: number[];
              clearCache?: boolean | undefined;
            };
            requestId: string;
            requestStatus: 'fulfilled';
          };
        }
      ) => {
        const { fileIds, clearCache } = meta.arg;

        // clear states
        if (clearCache) {
          state.annotations.byId = {};
          state.files.byId = {};
        } else {
          fileIds.forEach((fileId: any) => {
            const annotationIdsForFile = state.files.byId[fileId];
            if (annotationIdsForFile && annotationIdsForFile.length) {
              annotationIdsForFile.forEach((annotationId) => {
                delete state.annotations.byId[annotationId];
              });
            }
            delete state.files.byId[fileId];
          });
        }

        // update annotations
        // ToDo (VIS-768): conversion logic from V1 to V2 in the new slice can be moved into thunks.
        const annotations =
          convertCDFAnnotationV1ToVisionAnnotationBulk(payload);

        annotations.forEach((annotation) => {
          const resourceId: number | undefined = getAnnotatedResourceId({
            annotation,
          });

          if (resourceId) {
            if (
              state.files.byId[resourceId] &&
              !state.files.byId[resourceId].includes(annotation.id)
            ) {
              state.files.byId[resourceId].push(annotation.id);
            } else {
              state.files.byId[resourceId] = [annotation.id];
            }
          }

          if (
            !state.annotations.byId[annotation.id] ||
            state.annotations.byId[annotation.id].lastUpdatedTime !==
              annotation.lastUpdatedTime
          ) {
            state.annotations.byId[annotation.id] = annotation;
          }
        });
      }
    );
  },
});

export default annotationSlice.reducer;
