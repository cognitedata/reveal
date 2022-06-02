import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { convertCDFAnnotationV1ToVisionAnnotations } from 'src/api/annotation/bulkConverters';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { VisionAnnotationV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { DeleteAnnotationsV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsV1';
import { CreateAnnotationsV1 } from 'src/store/thunks/Annotation/CreateAnnotationsV1';
import { VisionJobUpdateV1 } from 'src/store/thunks/Process/VisionJobUpdateV1';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { clearAnnotationState } from 'src/store/commonActions';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import {
  clearAnnotationStates,
  repopulateAnnotationState,
} from 'src/modules/Common/store/annotation/util';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/annotation';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  isImageClassificationData,
  isImageObjectDetectionData,
  isImageKeypointCollectionData,
} from 'src/modules/Common/types/typeGuards';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { InternalId } from '@cognite/sdk';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';

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
      (state: AnnotationState, { payload }: { payload: InternalId[] }) => {
        payload.forEach((payloadId) => {
          const { id: annotationId } = payloadId;
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

            // clean color map
            if (
              isImageClassificationData(annotation) ||
              isImageObjectDetectionData(annotation) ||
              isImageKeypointCollectionData(annotation)
            ) {
              const labelOrText = getAnnotationLabelOrText(annotation);
              if (
                !Object.values(state.annotations.byId)
                  .map((stateAnnotation) =>
                    getAnnotationLabelOrText(stateAnnotation)
                  )
                  .includes(labelOrText)
              ) {
                delete state.annotationColorMap[labelOrText];
              }
            }
          }
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        // CreateAnnotationsV1.fulfilled,
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
