import {
  KeypointItem,
  KeypointVertex,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { FC } from 'react';
import {
  Category,
  Data,
  ReviewAnnotation,
  RowData,
  TreeNode,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  isAnnotationData,
  isCategoryData,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/nodeTreeUtils';
import {
  CategoryRow,
  KeypointReviewRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components';

/**
 * generates a node tree structure using the annotation heirarchy. Which then is provided to virtualized tree
 * This function is specific to AnnotationSidePanel since components are hardcoded into the function
 * @param data
 */
// todo: will add test in separate PR
export const generateNodeTree = (data: Data): TreeNode<Data> => {
  if (isCategoryData(data)) {
    const { title, common, selected, callbacks } = data as RowData<Category>;
    return {
      id: title,
      name: title,
      component: CategoryRow as FC<VirtualizedTreeRowProps<Data>>,
      children: common.annotations.map((annotation) =>
        generateNodeTree({ ...annotation, common, callbacks })
      ),
      openByDefault:
        selected ||
        common.annotations.some(
          (annotation) =>
            annotation.selected || isAnyKeypointChildSelected(annotation)
        ),
      additionalData: data,
    };
  }
  if (isAnnotationData(data)) {
    const { common, callbacks, ...annotation } =
      data as RowData<ReviewAnnotation>;

    return {
      id: annotation.id.toString(),
      name: annotation.label,
      component: common.component as FC<VirtualizedTreeRowProps<Data>>,
      openByDefault:
        annotation.selected || isAnyKeypointChildSelected(annotation),
      children:
        annotation.data?.keypoint && annotation?.region
          ? annotation.region.vertices.map((vertex) =>
              generateNodeTree({
                ...(vertex as KeypointVertex),
                common,
                callbacks,
              })
            )
          : [],
      additionalData: data,
    };
  }

  const keypointItem = data as RowData<KeypointItem>;

  return {
    id: keypointItem.id.toString(),
    name: keypointItem.caption,
    component: KeypointReviewRow as FC<VirtualizedTreeRowProps<Data>>,
    openByDefault: keypointItem.selected,
    children: [],
    additionalData: data,
  };
};

// todo: will add test in separate PR
/**
 * Checks whether any one of keypoint children of a keypoint annotation is selected
 * @param annotation
 */
const isAnyKeypointChildSelected = (annotation: ReviewAnnotation) => {
  return (
    !!annotation.data?.keypoint &&
    !!annotation?.region?.vertices.some(
      (vertex) => (vertex as KeypointItem).selected
    )
  );
};
