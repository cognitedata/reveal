import React, {
  CSSProperties,
  ReactText,
  useCallback,
  useEffect,
  useRef,
} from 'react';
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
import { AnnotationStatusChangeV1 } from 'src/store/thunks/Annotation/AnnotationStatusChangeV1';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { Modal } from 'antd';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { FileInfo } from '@cognite/sdk';

export const AnnotationDetailPanelHotKeys = ({
  scrollId,
  children,
  nodeTree,
  file,
}: {
  nodeTree: TreeNode<Data>[];
  children: any;
  scrollId: ReactText;
  file: FileInfo;
}) => {
  const dispatch = useDispatch();
  const modalRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (modalRef.current) {
        modalRef.current?.destroy();
      }
    };
  }, [file]);

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

  useHotkeys(
    HotKeys.approve_annotation,
    () => setStatusOnSelectedAnnotation(true),
    [nodeTree, scrollId]
  );

  useHotkeys(
    HotKeys.reject_annotation,
    () => setStatusOnSelectedAnnotation(false),
    [nodeTree, scrollId]
  );

  useHotkeys(HotKeys.delete_annotation, () => deleteSelectedAnnotation(), [
    nodeTree,
    scrollId,
  ]);

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

  const setStatusOnSelectedAnnotation = useCallback(
    (status: boolean) => {
      if (nodeTree.length) {
        let annotationId;
        const activeNode = getActiveNode(nodeTree);
        if (activeNode) {
          annotationId = activeNode.id;
        }
        if (annotationId) {
          dispatch(
            AnnotationStatusChangeV1({
              id: +annotationId,
              status: status
                ? AnnotationStatus.Verified
                : AnnotationStatus.Rejected,
            })
          );
        }
      }
    },
    [nodeTree]
  );

  const deleteSelectedAnnotation = useCallback(() => {
    if (nodeTree.length) {
      let annotationId: string;
      const activeNode = getActiveNode(nodeTree);
      if (activeNode && isAnnotationData(activeNode.additionalData)) {
        annotationId = activeNode.id;
      }

      const onConfirmDelete = async () => {
        await dispatch(
          DeleteAnnotationsAndHandleLinkedAssetsOfFile({
            annotationIds: [+annotationId!],
            showWarnings: true,
          })
        );
      };

      // @ts-ignore
      if (annotationId) {
        modalRef.current = Modal.confirm({
          title: 'Confirm Delete',
          content: 'Are you sure you want delete this annotation?',
          autoFocusButton: 'ok',
          okText: 'Confirm',
          okButtonProps: {
            style: {
              backgroundColor: 'var(--cogs-red)',
              color: 'white',
              '&:focus': {
                borderColor: 'var(--cogs-red)',
              },
            } as CSSProperties,
          },
          keyboard: true,
          getContainer: '.confirm-delete-modal-anchor',
          maskClosable: true,
          onOk: onConfirmDelete,
          onCancel: () => {},
        });
      }
    }
  }, [nodeTree]);

  return <>{children}</>;
};
