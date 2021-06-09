import {
  ByTreeIndexNodeSet,
  Cognite3DModel,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
} from '@cognite/reveal';
import React, { useEffect } from 'react';
import { SelectedNode } from 'src/store/modules/TreeView';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

export function useSelectedNodesHighlights({
  model,
}: {
  model: Cognite3DModel;
}) {
  const selectedNodes: Array<SelectedNode> = useSelector(
    ({ treeView }: RootState) => treeView.selectedNodes
  );
  const ghostModeEnabled = useSelector(
    ({ toolbar }: RootState) => toolbar.ghostModeEnabled
  );
  const selectedTreeIndicesNodeSetRef = React.useRef<ByTreeIndexNodeSet>(
    new ByTreeIndexNodeSet()
  );

  useEffect(() => {
    const selectedTreeIndicesNodeSet = selectedTreeIndicesNodeSetRef.current;
    model.addStyledNodeSet(selectedTreeIndicesNodeSet, {});
    return () => {
      if (selectedTreeIndicesNodeSet) {
        model.removeStyledNodeSet(selectedTreeIndicesNodeSet);
        selectedTreeIndicesNodeSet.clear();
      }
    };
  }, [model]);

  // ghost mode switcher + cleanup
  useEffect(() => {
    model.setDefaultNodeAppearance({ renderGhosted: ghostModeEnabled });

    model.changeStyledNodeSetAppearance(
      selectedTreeIndicesNodeSetRef.current,
      ghostModeEnabled
        ? { renderGhosted: false }
        : DefaultNodeAppearance.Highlighted
    );
  }, [model, ghostModeEnabled]);

  // selected nodes highlighter
  useEffect(() => {
    const highlightedSet = new IndexSet();

    selectedNodes.forEach(({ treeIndex, subtreeSize }) => {
      highlightedSet.addRange(new NumericRange(treeIndex, subtreeSize));
    });

    selectedTreeIndicesNodeSetRef.current.updateSet(highlightedSet);
  }, [model, selectedNodes]);
}
