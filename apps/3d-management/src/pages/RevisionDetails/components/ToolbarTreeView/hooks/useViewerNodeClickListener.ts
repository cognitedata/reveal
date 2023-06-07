import React, { useCallback, useEffect } from 'react';
import { NodesTreeViewRefType } from 'pages/RevisionDetails/components/TreeView/NodesTreeView';
import { useDispatch } from 'react-redux';
import { expandArbitraryNode, selectNodes } from 'store/modules/TreeView';
import { fireErrorNotification } from 'utils';
import {
  CogniteCadModel,
  Cognite3DViewer,
  PointerEventDelegate,
} from '@cognite/reveal';

type Args = {
  viewer: Cognite3DViewer;
  model: CogniteCadModel;
  treeViewRef: React.RefObject<NodesTreeViewRefType>;
  nodesClickable: boolean;
};

export function useViewerNodeClickListener({
  viewer,
  model,
  treeViewRef,
  nodesClickable,
}: Args) {
  const dispatch = useDispatch();

  const viewerNodeClickListener: PointerEventDelegate = useCallback(
    async (event) => {
      if (!nodesClickable) {
        return;
      }
      const intersection = await viewer.getIntersectionFromPixel(
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
              expandArbitraryNode({
                treeIndex,
                nodeId,
                onSuccess: () => {
                  // if node is not rendered in the DOM yet, scrollTo won't work
                  setTimeout(() => {
                    if (treeViewRef.current) {
                      treeViewRef.current.scrollTo({
                        key: treeIndex,
                      });
                    }
                  }, 200);
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
    [viewer, model, dispatch, treeViewRef, nodesClickable]
  );

  useEffect(() => {
    viewer.on('click', viewerNodeClickListener);
    return () => {
      viewer.off('click', viewerNodeClickListener);
    };
  }, [viewer, viewerNodeClickListener]);
}
