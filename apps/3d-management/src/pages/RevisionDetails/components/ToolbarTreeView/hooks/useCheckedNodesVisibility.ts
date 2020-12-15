import { useCallback, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { Cognite3DModel, Cognite3DViewer } from '@cognite/reveal';

export function useCheckedNodesVisibility(
  viewer: Cognite3DViewer,
  model: Cognite3DModel,
  checkedNodes: Array<number>
) {
  const nodesVisibilityChanged = useCallback(
    debounce((checkedKeys: Array<number>) => {
      model.hideAllNodes();
      checkedKeys.forEach((key) => {
        model.showNodeByTreeIndex(key, true);
      });
    }, 250), // delayed to give a chance to treeView to finish checkbox redraw
    [model]
  );

  // show only checked nodes
  useEffect(() => {
    nodesVisibilityChanged(checkedNodes);
  }, [model, checkedNodes, nodesVisibilityChanged]);
}
