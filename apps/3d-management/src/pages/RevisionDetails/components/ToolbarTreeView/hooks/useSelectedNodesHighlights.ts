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
            dispatch(selectNodes([{ treeIndex, nodeId, subtreeSize: 1 }]));
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

  useEffect(() => {
    let stylingFn: typeof model.selectNodeByTreeIndex;

    if (ghostModeEnabled) {
      stylingFn = model.unghostNodeByTreeIndex.bind(model);
      model.deselectAllNodes();
      model.ghostAllNodes();
    } else {
      stylingFn = model.selectNodeByTreeIndex.bind(model);
      model.unghostAllNodes();
      model.deselectAllNodes();
    }

    selectedNodes.forEach(({ treeIndex, subtreeSize }) => {
      // for big subtrees there is performance hit instead of performance gain
      // likely because stylingFn always creates promise
      if (typeof subtreeSize === 'undefined' || subtreeSize > 100000) {
        stylingFn(treeIndex, true);
      } else if (subtreeSize <= 1) {
        stylingFn(treeIndex, false);
      } else {
        for (let i = treeIndex; i < treeIndex + subtreeSize; i++) {
          stylingFn(i, false);
        }
      }
    });
  }, [model, ghostModeEnabled, selectedNodes]);

  useEffect(() => {
    viewer.on('click', viewerNodeClickListener);
    return () => {
      viewer.off('click', viewerNodeClickListener);
    };
  }, [viewer, viewerNodeClickListener]);
}
