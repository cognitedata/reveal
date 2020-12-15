import {
  Cognite3DModel,
  Cognite3DViewer,
  PointerEventDelegate,
} from '@cognite/reveal';
import React, { useCallback, useEffect } from 'react';
import {
  expandNodeByTreeIndex,
  SelectedNode,
  selectNodes,
} from 'src/store/modules/TreeView';
import { fireErrorNotification } from 'src/utils';
import { useDispatch, useSelector } from 'react-redux';
import { NodesTreeViewRefType } from 'src/pages/RevisionDetails/components/TreeView/NodesTreeView';
import { RootState } from 'src/store';

type Args = {
  viewer: Cognite3DViewer;
  model: Cognite3DModel;
  treeViewRef: React.RefObject<NodesTreeViewRefType>;
};

export function useSelectedNodesHighlights({
  viewer,
  model,
  treeViewRef,
}: Args) {
  const selectedNodes: Array<SelectedNode> = useSelector(
    ({ treeView }: RootState) => treeView.selectedNodes
  );
  const ghostModeEnabled = useSelector(
    ({ toolbar }: RootState) => toolbar.ghostModeEnabled
  );

  const dispatch = useDispatch();
  const viewerNodeClickListener: PointerEventDelegate = useCallback(
    (event) => {
      const { revisionId, modelId } = model;
      const intersection = viewer.getIntersectionFromPixel(
        event.offsetX,
        event.offsetY
      );
      if (intersection && 'treeIndex' in intersection) {
        const { treeIndex } = intersection;

        model
          .mapTreeIndexToNodeId(treeIndex)
          .then((nodeId: number) => {
            dispatch(selectNodes([{ treeIndex, nodeId, isLeaf: true }]));
            dispatch(
              expandNodeByTreeIndex({
                modelId,
                revisionId,
                treeIndex,
                nodeId,
                onSuccess: () => {
                  if (treeViewRef.current) {
                    treeViewRef.current.scrollTo(treeIndex);
                  }
                },
              })
            );
          })
          .catch((error) =>
            fireErrorNotification({
              error,
              message: `Couldn't map treeIndex=${treeIndex} to nodeId`,
            })
          );
      }
    },
    [viewer, model, dispatch, treeViewRef]
  );

  const highlightSelectedNodes = useCallback(() => {
    model.deselectAllNodes();
    selectedNodes.forEach(({ treeIndex, isLeaf }) => {
      model.selectNodeByTreeIndex(treeIndex, !isLeaf);
    });
  }, [model, selectedNodes]);

  const ghostSelectedNodes = useCallback(() => {
    model.ghostAllNodes();
    selectedNodes.forEach(({ treeIndex, isLeaf }) => {
      model.unghostNodeByTreeIndex(treeIndex, !isLeaf);
    });
  }, [model, selectedNodes]);

  useEffect(() => {
    if (ghostModeEnabled) {
      model.deselectAllNodes();
      ghostSelectedNodes();
    } else {
      model.unghostAllNodes();
      highlightSelectedNodes();
    }
  }, [model, ghostModeEnabled, ghostSelectedNodes, highlightSelectedNodes]);

  useEffect(() => {
    viewer.on('click', viewerNodeClickListener);
    return () => {
      viewer.off('click', viewerNodeClickListener);
    };
  }, [viewer, viewerNodeClickListener]);
}
