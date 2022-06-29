import { FC } from 'react';
import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowData,
  AnnotationDetailPanelRowDataBase,
  TreeNode,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  isVisionReviewAnnotationRowData,
  isAnnotationTypeRowData,
  isVisionReviewImageKeypointCollection,
  isVisionReviewImageKeypointRowData,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/nodeTreeUtils';
import {
  ReviewVisionAnnotationTypeRow,
  ReviewKeypointRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components';

import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  PredefinedKeypoint,
  ReviewKeypoint,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { PredefinedKeypointRow } from 'src/modules/Review/Containers/AnnotationDetailPanel/components/PredefinedKeypointRow';

/**
 * Recursive method that generates a node tree structure using the annotation hierarchy:
 *
 *      annotation type -> annotation instance -> keypoint instance (for keypoint collections only)
 *
 * Node tree is then provided to a virtualized tree. This function is specific to AnnotationSidePanel
 * since components are hardcoded into the function.
 *
 * @todo [VIS-867] Add tests
 */
export const generateNodeTree = (
  rowData: AnnotationDetailPanelRowData
): TreeNode<AnnotationDetailPanelRowData> => {
  /**
   * Check if row data corresponds to annotation type header and if so call the function recursively
   * with the individual annotation instances as input
   */
  if (isAnnotationTypeRowData(rowData)) {
    const { title, common, selected, callbacks } =
      rowData as AnnotationDetailPanelRowDataBase<AnnotationDetailPanelAnnotationType>;
    return {
      id: title,
      name: title,
      component: ReviewVisionAnnotationTypeRow as FC<
        VirtualizedTreeRowProps<AnnotationDetailPanelRowData>
      >,
      children: common.reviewAnnotations.map((reviewAnnotation) =>
        generateNodeTree({
          ...reviewAnnotation,
          common: { ...common, color: reviewAnnotation.color },
          callbacks,
        })
      ),
      // check if the annotation type header, annotations within or any keypoints within an annotation
      // in case of keypoint collections, are selected.
      openByDefault:
        selected ||
        common.reviewAnnotations.some(
          (
            reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>
          ) =>
            reviewAnnotation.selected ||
            isAnyKeypointChildSelected(reviewAnnotation)
        ),
      additionalData: rowData,
    };
  }

  /**
   * Check if row data corresponds to a `VisionReviewAnnotation` instance. Represents a node leaf in the tree,
   *  unless the annotation type is `ImageKeypointCollection`, in which case the function is called recursively
   * for each keypoint within the keypoint collection.
   */
  if (isVisionReviewAnnotationRowData(rowData)) {
    const { common, callbacks, ...reviewAnnotation } =
      rowData as AnnotationDetailPanelRowDataBase<
        VisionReviewAnnotation<VisionAnnotationDataType>
      >;

    const data = {
      id: reviewAnnotation.annotation.id.toString(),
      name: getAnnotationLabelOrText(reviewAnnotation.annotation),
      component: common.component as FC<
        VirtualizedTreeRowProps<AnnotationDetailPanelRowData>
      >,
      openByDefault:
        reviewAnnotation.selected ||
        isAnyKeypointChildSelected(reviewAnnotation),
      additionalData: rowData,
    };

    if (isVisionReviewImageKeypointCollection(reviewAnnotation)) {
      return {
        ...data,
        children: reviewAnnotation.annotation.keypoints
          .map((reviewImageKeypoint, index) =>
            generateNodeTree({
              ...reviewImageKeypoint,
              common: { ...common, index, color: reviewAnnotation.color }, // keypoint index and color is passed as common attributes
              callbacks,
            })
          )
          .concat(
            common.tempKeypointCollection?.id === reviewAnnotation.annotation.id
              ? common.tempKeypointCollection.remainingKeypoints.map(
                  (predefinedKeypoint, index) =>
                    generateNodeTree({
                      ...predefinedKeypoint,
                      common: {
                        ...common,
                        index:
                          index + reviewAnnotation.annotation.keypoints.length,
                        color: reviewAnnotation.color,
                      }, // keypoint index and color is passed as common attributes
                      callbacks,
                    })
                )
              : []
          ),
      };
    }

    return { ...data, children: [] };
  }

  /**
   * If row data is the type of AnnotationDetailPanelRowDataBase<ReviewKeypoint>
   *
   * @see `AnnotationDetailPanelRowData` definition
   */
  if (isVisionReviewImageKeypointRowData(rowData)) {
    const reviewImageKeypoint =
      rowData as AnnotationDetailPanelRowDataBase<ReviewKeypoint>;
    return {
      id: reviewImageKeypoint.id.toString(),
      name: reviewImageKeypoint.keypoint.label,
      component: ReviewKeypointRow as FC<
        VirtualizedTreeRowProps<AnnotationDetailPanelRowData>
      >,
      openByDefault: reviewImageKeypoint.selected,
      children: [],
      additionalData: rowData,
    };
  }

  /**
   * If row data does not have type `AnnotationDetailPanelAnnotationType`, `VisionReviewAnnotation<VisionAnnotationDataType>`
   * or`ReviewKeypoint` it must be 'PredefinedKeypoint'. This predefined keypoint is added as a node leaf in the tree as sub node
   * of a `VisionReviewAnnotation<ImageKeypointCollection>`
   *
   * @see `AnnotationDetailPanelRowData` definition
   */

  const remainingPredefinedKeypoint =
    rowData as AnnotationDetailPanelRowDataBase<PredefinedKeypoint>;
  return {
    id: remainingPredefinedKeypoint.caption,
    name: remainingPredefinedKeypoint.caption,
    component: PredefinedKeypointRow as FC<
      VirtualizedTreeRowProps<AnnotationDetailPanelRowData>
    >,
    openByDefault: true,
    children: [],
    additionalData: rowData,
  };
};

/**
 * Checks whether a `VisionReviewAnnotation` has annotation type `ImageKeypointCollection`
 * and has any keypoints that are selected
 *
 * @todo [VIS-867] Add tests
 */
const isAnyKeypointChildSelected = (
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>
) => {
  return (
    isVisionReviewImageKeypointCollection(reviewAnnotation) &&
    reviewAnnotation.annotation.keypoints.some(
      (reviewImageKeypoint) => reviewImageKeypoint.selected
    )
  );
};
