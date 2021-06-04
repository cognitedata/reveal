import {
  ByTreeIndexNodeSet,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
  PointerEventDelegate,
} from '@cognite/reveal';
import React, { useCallback, useEffect } from 'react';
import {
  expandArbitraryNode,
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
    [viewer, model, dispatch, treeViewRef]
  );

  const prevSelectedNodesSetRef = React.useRef<ByTreeIndexNodeSet>();

  useEffect(() => {
    model.setDefaultNodeAppearance(
      ghostModeEnabled
        ? DefaultNodeAppearance.Ghosted
        : DefaultNodeAppearance.Default
    );

    if (prevSelectedNodesSetRef.current) {
      model.removeStyledNodeSet(prevSelectedNodesSetRef.current);
      model.addStyledNodeSet(
        prevSelectedNodesSetRef.current,
        ghostModeEnabled
          ? DefaultNodeAppearance.Default
          : DefaultNodeAppearance.Highlighted
      );
    }
  }, [model, ghostModeEnabled]);

  useEffect(() => {
    const highlightedSet = new IndexSet();

    selectedNodes.forEach(({ treeIndex, subtreeSize }) => {
      highlightedSet.addRange(new NumericRange(treeIndex, subtreeSize));
    });
    const selectedNodesStyledSet = new ByTreeIndexNodeSet(highlightedSet);

    if (prevSelectedNodesSetRef.current) {
      model.removeStyledNodeSet(prevSelectedNodesSetRef.current);
    }
    prevSelectedNodesSetRef.current = selectedNodesStyledSet;
    model.addStyledNodeSet(
      selectedNodesStyledSet,
      ghostModeEnabled
        ? DefaultNodeAppearance.Default
        : DefaultNodeAppearance.Highlighted
    );
  }, [model, ghostModeEnabled, selectedNodes]);

  useEffect(() => {
    viewer.on('click', viewerNodeClickListener);
    return () => {
      viewer.off('click', viewerNodeClickListener);
    };
  }, [viewer, viewerNodeClickListener]);
}
