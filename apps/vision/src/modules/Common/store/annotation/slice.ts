import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { clearAnnotationState } from '../../../../store/commonActions';
import { DeleteAnnotations } from '../../../../store/thunks/Annotation/DeleteAnnotations';
import { PopulateAnnotationTemplates } from '../../../../store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from '../../../../store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from '../../../../store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from '../../../../store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from '../../../../store/thunks/Annotation/UpdateAnnotations';
import { DeleteFilesById } from '../../../../store/thunks/Files/DeleteFilesById';
import { VisionJobUpdate } from '../../../../store/thunks/Process/VisionJobUpdate';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '../../types/annotation';

import { AnnotationState } from './types';
import { clearAnnotationStates, repopulateAnnotationState } from './util';

export const initialState: AnnotationState = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
  annotationColorMap: {},
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
          payload: VisionAnnotation<VisionAnnotationDataType>[];
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
        clearAnnotationStates(state, fileIds, clearCache);

        repopulateAnnotationState(state, payload);
      }
    );

    builder.addCase(
      DeleteAnnotations.fulfilled,
      (state: AnnotationState, { meta: { arg } }) => {
        arg.forEach((fileId) => {
          const { id: annotationId } = fileId;
          const annotation = state.annotations.byId[annotationId];

          if (annotation) {
            const resourceId: number = annotation.annotatedResourceId;
            const annotatedFileState = state.files.byId[resourceId];
            if (annotatedFileState) {
              const filteredState = annotatedFileState.filter(
                (id) => id !== annotationId
              );
              if (filteredState.length) {
                state.files.byId[resourceId] = filteredState;
              } else {
                delete state.files.byId[resourceId];
              }
            }
            delete state.annotations.byId[annotationId];

            // don't clean annotationColorMap
          }
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        PopulateAnnotationTemplates.fulfilled,
        SaveAnnotationTemplates.fulfilled
      ),
      (state: AnnotationState, { payload }) => {
        // TODO: handle the case when a shape and collection template have same name
        // but user has selected different color for each of them
        const uniqueTemplateNames = [
          ...new Set(
            payload.predefinedShapes
              .map(({ shapeName, color }) => ({
                name: shapeName,
                color,
              }))
              .concat(
                payload.predefinedKeypointCollections.map(
                  ({ collectionName, color }) => ({
                    name: collectionName,
                    color,
                  })
                )
              )
          ),
        ];

        state.annotationColorMap = Object.assign(
          state.annotationColorMap,
          Object.fromEntries(
            uniqueTemplateNames.map((item) => [item.name, item.color])
          )
        );
      }
    );

    builder.addMatcher(
      isAnyOf(
        SaveAnnotations.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled
      ),
      (state: AnnotationState, { payload }) => {
        // update annotations
        repopulateAnnotationState(state, payload);
      }
    );

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearAnnotationState),
      (state: AnnotationState, action) => {
        clearAnnotationStates(state, action.payload, false);
      }
    );
  },
});

export default annotationSlice.reducer;
