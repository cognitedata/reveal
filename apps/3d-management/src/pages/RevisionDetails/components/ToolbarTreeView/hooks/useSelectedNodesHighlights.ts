import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import debounce from 'lodash/debounce';

import {
  TreeIndexNodeCollection,
  CogniteCadModel,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
  Cognite3DViewer,
} from '@cognite/reveal';

import { RootState } from '../../../../../store';
import { SelectedNode } from '../../../../../store/modules/TreeView';
import { assignOrUpdateStyledNodeCollection } from '../../../../../utils/sdk/3dNodeStylingUtils';

export function useSelectedNodesHighlights({
  model,
  viewer,
}: {
  model: CogniteCadModel;
  viewer: Cognite3DViewer;
}) {
  const selectedNodes: Array<SelectedNode> = useSelector(
    ({ treeView }: RootState) => treeView.selectedNodes
  );
  const ghostModeEnabled = useSelector(
    ({ toolbar }: RootState) => toolbar.ghostModeEnabled
  );
  const selectedTreeIndicesNodeSetRef = React.useRef<TreeIndexNodeCollection>(
    new TreeIndexNodeCollection()
  );

  useEffect(() => {
    const selectedTreeIndicesNodeSet = selectedTreeIndicesNodeSetRef.current;
    assignOrUpdateStyledNodeCollection(model, selectedTreeIndicesNodeSet, {});
    return () => {
      if (selectedTreeIndicesNodeSet === undefined) {
        return;
      }
      selectedTreeIndicesNodeSet.clear();
      if (viewer.models.includes(model)) {
        model.unassignStyledNodeCollection(selectedTreeIndicesNodeSet);
      }
    };
  }, [model, viewer]);

  // ghost mode switcher + cleanup
  useEffect(() => {
    model.setDefaultNodeAppearance({ renderGhosted: ghostModeEnabled });

    assignOrUpdateStyledNodeCollection(
      model,
      selectedTreeIndicesNodeSetRef.current,
      ghostModeEnabled
        ? { renderGhosted: false }
        : DefaultNodeAppearance.Highlighted
    );
  }, [model, ghostModeEnabled]);

  const updateHighlightedSet = React.useCallback((highlightedSet: IndexSet) => {
    selectedTreeIndicesNodeSetRef.current.updateSet(highlightedSet);
  }, []);

  const updateHighlightedSetDebounced = React.useMemo(
    () => debounce(updateHighlightedSet, 200),
    [updateHighlightedSet]
  );

  // selected nodes highlighter
  useEffect(() => {
    const highlightedSet = new IndexSet();

    selectedNodes.forEach(({ treeIndex, subtreeSize }) => {
      highlightedSet.addRange(new NumericRange(treeIndex, subtreeSize));
    });

    // for small subtree it's faster to highlight it instantly,
    // but bigger one takes some time to update and it blocks UI a bit, so in that case it's better to have it debounced
    // to give the chance for UI updates to pause and update only after that
    if (highlightedSet.count < 100000) {
      updateHighlightedSetDebounced.cancel();
      updateHighlightedSet(highlightedSet);
    } else {
      updateHighlightedSetDebounced(highlightedSet);
    }
  }, [selectedNodes, updateHighlightedSet, updateHighlightedSetDebounced]);
}
