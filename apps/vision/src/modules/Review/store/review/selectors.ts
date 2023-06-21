import { FileInfo } from '@cognite/sdk';
import { createSelector } from '@reduxjs/toolkit';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { RootState } from 'src/store/rootReducer';
import { createFileInfo } from 'src/store/util/StateUtils';
import { makeSelectFileAnnotations } from 'src/modules/Common/store/annotation/selectors';
import {
  isImageClassificationData,
  isImageKeypointCollectionData,
} from 'src/modules/Common/types/typeGuards';
import { Status } from 'src/api/annotation/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { VisionReviewAnnotation } from 'src/modules/Review/types';
import { getAnnotationColor } from 'src/utils/colorUtils';
import { ReviewState } from 'src/modules/Review/store/review/types';

// selectors

export const selectAllReviewFiles = createSelector(
  (state: RootState) => state.fileReducer.files.byId,
  (state: RootState) => state.reviewSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectAnnotationSettingsState = createSelector(
  (state: ReviewState) => state.annotationSettings,
  (annotationSettingsState) => {
    const settingsState = {
      ...annotationSettingsState,
      ...(!annotationSettingsState.createNew.text &&
        !annotationSettingsState.createNew.color && { createNew: {} }),
    };
    return settingsState;
  }
);

const fileAnnotationsSelector = makeSelectFileAnnotations();

export const selectVisionReviewAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    fileAnnotationsSelector(state.annotationReducer, fileId),
  (state: RootState) => state.reviewSlice.selectedAnnotationIds,
  (state: RootState) => state.reviewSlice.hiddenAnnotationIds,
  (state: RootState) => state.annotatorWrapperReducer.keypointMap.selectedIds,
  (state: RootState) => state.annotationReducer.annotationColorMap,

  (
    fileAnnotations,
    selectedAnnotationIds,
    hiddenAnnotationIds,
    selectedKeypointIds,
    annotationColorMap
  ): VisionReviewAnnotation<VisionAnnotationDataType>[] => {
    return fileAnnotations
      .map((ann) => ({
        annotation: ann,
        show: !hiddenAnnotationIds.includes(ann.id),
        selected: selectedAnnotationIds.includes(ann.id),
        color: getAnnotationColor(
          annotationColorMap,
          getAnnotationLabelOrText(ann),
          ann.annotationType
        ),
      }))
      .map((reviewAnn) => {
        if (isImageKeypointCollectionData(reviewAnn.annotation)) {
          const keypoints = Object.fromEntries(
            Object.entries(reviewAnn.annotation.keypoints).map(
              ([label, keypoint]) => {
                const id = `${reviewAnn.annotation.id}-${label}`;
                return [
                  label,
                  {
                    keypoint,
                    id,
                    label,
                    color: reviewAnn.color, // NOTE: it is possible to have colors per keypoint
                    selected: selectedKeypointIds.includes(id),
                  },
                ];
              }
            )
          );
          return {
            ...reviewAnn,
            annotation: {
              ...reviewAnn.annotation,
              keypoints,
            },
          };
        }
        return reviewAnn;
      });
  }
);

export const selectNonRejectedVisionReviewAnnotationsForFile = createSelector(
  selectVisionReviewAnnotationsForFile,
  (allVisibleAnnotations) => {
    return allVisibleAnnotations.filter(
      (ann) =>
        ann.show &&
        !isImageClassificationData(ann.annotation) && // todo: remove this once imageClassification annotations are supported
        ann.annotation.status !== Status.Rejected
    );
  }
);
