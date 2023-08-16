/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { useReveal, type NodeDataResult } from '../';
import { useEffect, useState } from 'react';
import { useNodeMappedData } from './useNodeMappedData';

export type ClickedNodeData = NodeDataResult & {
  intersection: CadIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);

        if (intersection === null || intersection.type !== 'cad') {
          return;
        }

        setCadIntersection(intersection);
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const nodeData = useNodeMappedData(cadIntersection?.treeIndex, cadIntersection?.model);

  if (cadIntersection === undefined || nodeData.length === 0) {
    return undefined;
  }

  const chosenNode = nodeData[0];

  return {
    intersection: cadIntersection,
    fdmNode: chosenNode.fdmId,
    view: chosenNode.view,
    cadNode: chosenNode.cadNode
  };
};
