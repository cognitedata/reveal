import { KeypointItem, KeypointVertex } from 'src/utils/AnnotationUtils';
import {
  Category,
  Data,
  ReviewAnnotation,
  RowData,
  TreeNode,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Components/AnnotationReviewDetailComponents/types';
import { CategoryRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/CategoryRow';
import { FC } from 'react';
import { KeypointReviewRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/KeypointReviewRow';

const isCategory = (data: Data): data is RowData<Category> => {
  return !!(data as Category).emptyPlaceholder;
};

const isAnnotation = (data: Data): data is RowData<ReviewAnnotation> => {
  return !!(data as ReviewAnnotation).lastUpdatedTime;
};

/**
 * generates a node tree structure using the annotation heirarchy. Which then is provided to virtualized tree
 * This function is specific to AnnotationSidePanel since components are hardcoded into the function
 * @param data
 */
export const generateNodeTree = (data: Data): TreeNode<Data> => {
  if (isCategory(data)) {
    const { title, common, selected, callbacks } = data as RowData<Category>;
    return {
      id: title,
      name: title,
      component: CategoryRow as FC<VirtualizedTreeRowProps<Data>>,
      children: common.annotations.map((annotation) =>
        generateNodeTree({ ...annotation, common, callbacks })
      ),
      openByDefault: selected,
      additionalData: data,
    };
  }
  if (isAnnotation(data)) {
    const { common, callbacks, ...annotation } =
      data as RowData<ReviewAnnotation>;

    return {
      id: annotation.id.toString(),
      name: annotation.label,
      component: common.component as FC<VirtualizedTreeRowProps<Data>>,
      openByDefault:
        annotation.selected ||
        (!!annotation.data?.keypoint &&
          !!annotation?.region?.vertices.some(
            (vertex) => (vertex as KeypointItem).selected
          )),
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
    openByDefault: true,
    children: [],
    additionalData: data,
  };
};
