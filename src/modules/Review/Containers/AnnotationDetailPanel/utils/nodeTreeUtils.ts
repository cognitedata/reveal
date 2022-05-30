import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowData,
  AnnotationDetailPanelRowDataBase,
  TreeNode,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import isNumber from 'lodash-es/isNumber';
import isInteger from 'lodash-es/isInteger';
import isFinite from 'lodash-es/isFinite';
import {
  ReviewKeypoint,
  VisionReviewAnnotation,
} from 'src/modules/Review/store/review/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import {
  CDFAnnotationTypeEnum,
  ImageKeypointCollection,
} from 'src/api/annotation/types';

export const isAnnotationTypeRowData = (
  data: AnnotationDetailPanelRowData
): data is AnnotationDetailPanelRowDataBase<AnnotationDetailPanelAnnotationType> => {
  const castedType =
    data as AnnotationDetailPanelRowDataBase<AnnotationDetailPanelAnnotationType>;

  return (
    'title' in castedType &&
    'selected' in castedType &&
    'emptyPlaceholder' in castedType
  );
};

export const isVisionReviewAnnotationRowData = (
  data: AnnotationDetailPanelRowData
): data is AnnotationDetailPanelRowDataBase<
  VisionReviewAnnotation<VisionAnnotationDataType>
> => {
  const castedType = data as AnnotationDetailPanelRowDataBase<
    VisionReviewAnnotation<VisionAnnotationDataType>
  >;

  return (
    'annotation' in castedType &&
    'selected' in castedType &&
    'show' in castedType
  );
};

export const isVisionReviewImageKeypointRowData = (
  data: AnnotationDetailPanelRowData
): data is AnnotationDetailPanelRowDataBase<ReviewKeypoint> => {
  const castedType = data as AnnotationDetailPanelRowDataBase<ReviewKeypoint>;

  return (
    'keypoint' in castedType &&
    'label' in castedType.keypoint &&
    'point' in castedType.keypoint
  );
};

export const isVisionReviewImageKeypointCollection = (
  data: VisionReviewAnnotation<VisionAnnotationDataType>
): data is VisionReviewAnnotation<ImageKeypointCollection> => {
  const castedType = data as VisionReviewAnnotation<ImageKeypointCollection>;

  return (
    castedType.annotation.annotationType ===
    CDFAnnotationTypeEnum.ImagesKeypointCollection
  );
};

/**
 * Returns current active node or returns undefined
 * @param nodeArr
 */
export const getActiveNode = (
  nodeArr: TreeNode<AnnotationDetailPanelRowData>[]
): TreeNode<AnnotationDetailPanelRowData> | undefined => {
  if (!nodeArr.length) {
    return undefined;
  }
  const selectedNode = nodeArr.find((node) => node.openByDefault);

  if (selectedNode) {
    const activeChildNode = getActiveNode(selectedNode.children);
    if (!activeChildNode) {
      return selectedNode;
    }
    return activeChildNode;
  }
  return undefined;
};

export const getActiveNodeIndexFromArray = (
  nodeArr: TreeNode<AnnotationDetailPanelRowData>[]
): number | undefined => {
  const index = nodeArr.findIndex((node) => node.openByDefault);
  return index >= 0 ? index : undefined;
};

export const getActiveNodeSiblings = (
  nodeArr: TreeNode<AnnotationDetailPanelRowData>[]
): TreeNode<AnnotationDetailPanelRowData>[] => {
  if (!nodeArr.length) {
    return [];
  }
  const selectedNode = nodeArr.find((node) => node.openByDefault);

  if (selectedNode) {
    const activeChildNodeSiblings = getActiveNodeSiblings(
      selectedNode.children
    );
    if (!activeChildNodeSiblings?.length) {
      return nodeArr;
    }
    return activeChildNodeSiblings;
  }
  return [];
};

export const getActiveNodeParent = (
  nodeArr: TreeNode<AnnotationDetailPanelRowData>[],
  parent?: TreeNode<AnnotationDetailPanelRowData>
): TreeNode<AnnotationDetailPanelRowData> | undefined => {
  if (!nodeArr.length) {
    return undefined;
  }
  const selectedNode = nodeArr.find((node) => node.openByDefault);

  if (selectedNode) {
    const activeChildNodeParent = getActiveNodeParent(
      selectedNode.children,
      selectedNode
    );
    if (!activeChildNodeParent) {
      return parent;
    }
    return activeChildNodeParent;
  }
  return undefined;
};

export const getNodeFromRowSelect = (
  nodeArr: TreeNode<AnnotationDetailPanelRowData>[],
  getRowIndex: (
    rows: TreeNode<AnnotationDetailPanelRowData>[],
    currentActiveRowIndex: number | undefined
  ) => number | null
): TreeNode<AnnotationDetailPanelRowData> | null => {
  let node: TreeNode<AnnotationDetailPanelRowData> | null = null;
  if (nodeArr.length && !!getRowIndex) {
    let rows = getActiveNodeSiblings(nodeArr);

    if (!rows?.length) {
      rows = nodeArr;
    }

    if (rows.length) {
      const currentActiveRowIndex = getActiveNodeIndexFromArray(rows);

      const rowIndex = getRowIndex(rows, currentActiveRowIndex);

      if (isNumber(rowIndex) && rowIndex >= 0 && rowIndex < rows.length) {
        node = rows[rowIndex];
      } else {
        console.error('ShortKeyUtils: Received invalid row index!', {
          rows,
          rowIndex,
        });
      }
    }
  }
  return node;
};

/**
 * provides next or first index when array length and current selected index is given
 * @param index
 * @param length
 */
export const selectNextOrFirstIndexArr = (index?: number, length?: number) => {
  if (isNumber(length) && isInteger(length) && isFinite(length) && length > 0) {
    if (
      index !== undefined &&
      isNumber(index) &&
      isInteger(index) &&
      isFinite(index) &&
      index >= 0
    ) {
      const nextIndex = index + 1;

      if (nextIndex < length) {
        return nextIndex;
      }
      return nextIndex - length;
    }
    return 0;
  }
  return null;
};

/**
 * provides previous or first index when array length and current selected index is given
 * @param index
 * @param length
 */
export const selectPrevOrFirstIndexArr = (index?: number, length?: number) => {
  if (isNumber(length) && isInteger(length) && isFinite(length) && length > 0) {
    if (
      index !== undefined &&
      isNumber(index) &&
      isInteger(index) &&
      isFinite(index) &&
      index >= 0
    ) {
      const prevIndex = index - 1;
      if (prevIndex < 0) {
        return length + prevIndex;
      }
      return prevIndex;
    }
    return 0;
  }
  return null;
};
