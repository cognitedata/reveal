/*!
 * Copyright 2023 Cognite AS
 */

import { Intersection, type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { useReveal, type NodeDataResult } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';

export type ClickedNodeData = NodeDataResult & {
  intersection: CadIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [nodeData, setNodeData] = useState<ClickedNodeData | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);
        const nodeData = computeNodeDataFromIntersection(intersection);

        setNodeData(nodeData);

      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  return nodeData;
};

function computeNodeDataFromIntersection(intersection: Intersection | null): ClickedNodeData | undefined {
  if (intersection === null || intersection.type !== 'cad') {
    return undefined;
  }

  const nodeData =
    useFdm3dNodeData(
      intersection?.model.modelId,
      intersection?.model.revisionId,
      intersection?.treeIndex
    ).data ?? [];

  if (intersection === undefined || nodeData.length === 0) {
    return undefined;
  }

  const chosenNode = nodeData[0];

  return {
    intersection,
    fdmNode: chosenNode.fdmId,
    view: chosenNode.view,
    cadNode: chosenNode.cadNode
  };
}
