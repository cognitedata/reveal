import {
  Category,
  Data,
  ReviewAnnotation,
  RowData,
  TreeNode,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import isNumber from 'lodash-es/isNumber';
import isInteger from 'lodash-es/isInteger';
import isFinite from 'lodash-es/isFinite';

export const isCategoryData = (data: Data): data is RowData<Category> => {
  return !!(data as Category).emptyPlaceholder;
};

export const isAnnotationData = (
  data: Data
): data is RowData<ReviewAnnotation> => {
  return (
    'annotatedResourceId' in (data as ReviewAnnotation) &&
    'lastUpdatedTime' in (data as ReviewAnnotation)
  );
};

export const isKeypointAnnotationData = (
  data: Data
): data is RowData<ReviewAnnotation> => {
  return !!(data as ReviewAnnotation).data?.keypoint;
};

/**
 * Returns current active node or returns undefined
 * @param nodeArr
 */
export const getActiveNode = (
  nodeArr: TreeNode<Data>[]
): TreeNode<Data> | undefined => {
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
  nodeArr: TreeNode<Data>[]
): number | undefined => {
  const index = nodeArr.findIndex((node) => node.openByDefault);
  return index >= 0 ? index : undefined;
};

export const getActiveNodeSiblings = (
  nodeArr: TreeNode<Data>[]
): TreeNode<Data>[] => {
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
  nodeArr: TreeNode<Data>[],
  parent?: TreeNode<Data>
): TreeNode<Data> | undefined => {
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
  nodeArr: TreeNode<Data>[],
  getRowIndex: (
    rows: TreeNode<Data>[],
    currentActiveRowIndex: number | undefined
  ) => number | null
): TreeNode<Data> | null => {
  let node: TreeNode<Data> | null = null;
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
