import React, { ReactText, useCallback } from 'react';
import {
  keypointSelectStatusChange,
  selectCollection,
} from 'src/modules/Review/store/annotationLabel/slice';
import { useDispatch } from 'react-redux';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import {
  selectAnnotation,
  setScrollToId,
} from 'src/modules/Review/store/reviewSlice';
import { Categories } from 'src/modules/Review/types';
import {
  getActiveNode,
  getActiveNodeIndexFromArray,
  getActiveNodeParent,
  getNodeFromRowSelect,
  isAnnotationData,
  isCategoryData,
  isKeypointAnnotationData,
  selectNextOrFirstIndexArr,
  selectPrevOrFirstIndexArr,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/nodeTreeUtils';
import {
  Data,
  TreeNode,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import { useHotkeys } from 'react-hotkeys-hook';
import { selectCategory } from 'src/modules/Review/Containers/AnnotationDetailPanel/store/slice';
import { HotKeys } from 'src/constants/HotKeys';

export const AnnotationDetailPanelHotKeys = ({
  scrollId,
  children,
  nodeTree,
}: {
  nodeTree: TreeNode<Data>[];
  children: any;
  scrollId: ReactText;
}) => {
  const dispatch = useDispatch();

  useHotkeys(HotKeys.move_down_annotation_list, () => selectNextRow(), [
    nodeTree,
    scrollId,
  ]);
  useHotkeys(HotKeys.move_up_annotation_list, () => selectPrevRow(), [
    nodeTree,
    scrollId,
  ]);
  useHotkeys(
    HotKeys.move_out_annotation_collection,
    () => moveOutAnnotationCollection(),
    [nodeTree, scrollId]
  );

  useHotkeys(
    HotKeys.move_into_annotation_collection,
    () => moveIntoAnnotationCollection(),
    [nodeTree, scrollId]
  );

  const setSelectedNodeAsActive = (id: string, node: TreeNode<Data>) => {
    dispatch(deselectAllSelectionsReviewPage());
    if (isCategoryData(node.additionalData)) {
      dispatch(selectCategory({ category: id as Categories, selected: true }));
    } else if (isAnnotationData(node.additionalData)) {
      if (
        isKeypointAnnotationData(node.additionalData) && // if this is current Collection
        !node.additionalData.lastUpdatedTime
      ) {
        dispatch(selectCollection(id));
      } else {
        dispatch(selectAnnotation(+id));
      }
    } else {
      dispatch(keypointSelectStatusChange(id));
    }
    dispatch(setScrollToId(id));
  };

  const selectPrevRow = useCallback(() => {
    const node = getNodeFromRowSelect(nodeTree, (rows, currentActiveRowIndex) =>
      selectPrevOrFirstIndexArr(currentActiveRowIndex, rows.length)
    );
    if (node) {
      setSelectedNodeAsActive(node.id, node);
    }
  }, [nodeTree]);

  const selectNextRow = useCallback(() => {
    const node = getNodeFromRowSelect(nodeTree, (rows, currentActiveRowIndex) =>
      selectNextOrFirstIndexArr(currentActiveRowIndex, rows.length)
    );

    if (node) {
      setSelectedNodeAsActive(node.id, node);
    }
  }, [nodeTree]);

  const moveIntoAnnotationCollection = useCallback(() => {
    if (nodeTree.length) {
      let node;

      const activeNode = getActiveNode(nodeTree);

      if (activeNode) {
        const childNodes = activeNode.children;

        if (childNodes.length) {
          const currentActiveChildIndex =
            getActiveNodeIndexFromArray(childNodes);

          if (currentActiveChildIndex === undefined) {
            // eslint-disable-next-line prefer-destructuring
            node = childNodes[0];
          } else {
            node = childNodes[currentActiveChildIndex];
          }
        }
      }

      if (node) {
        setSelectedNodeAsActive(node.id, node);
      }
    }
  }, [nodeTree]);

  const moveOutAnnotationCollection = useCallback(() => {
    if (nodeTree.length) {
      const node = getActiveNodeParent(nodeTree);

      if (node) {
        setSelectedNodeAsActive(node.id, node);
      }
    }
  }, [nodeTree]);

  return <>{children}</>;
};
