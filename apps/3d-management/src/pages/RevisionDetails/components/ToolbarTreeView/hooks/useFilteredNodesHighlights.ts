import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import React, { useEffect } from 'react';
import { v3Client } from '@cognite/cdf-sdk-singleton';
import {
  ByNodePropertyNodeSet,
  Cognite3DModel,
  NodeOutlineColor,
} from '@cognite/reveal';

export function useFilteredNodesHighlights({
  model,
}: {
  model: Cognite3DModel;
}) {
  const filter = useSelector(
    ({ treeView }: RootState) => treeView.nodePropertyFilter
  );
  const filteredNodes = React.useRef<ByNodePropertyNodeSet>(
    new ByNodePropertyNodeSet(v3Client as any, model, { requestPartitions: 10 })
  );
  useEffect(() => {
    const filteredNodesSet = filteredNodes.current;
    model.addStyledNodeSet(filteredNodesSet, {
      outlineColor: NodeOutlineColor.Cyan,
      renderInFront: true,
      renderGhosted: false,
    });
    return () => {
      model.removeStyledNodeSet(filteredNodesSet);
      if (filteredNodesSet) {
        filteredNodesSet.clear();
      }
    };
  }, [model]);

  useEffect(() => {
    if (!filter) {
      filteredNodes.current.clear();
    } else {
      filteredNodes.current.executeFilter(filter);
    }
  }, [filter]);
}
