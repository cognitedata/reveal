/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { type FdmAssetMappingsConfig, useReveal, type NodeDataResult } from '../';
import { useEffect, useState } from 'react';
import { useNodeMappedData } from './useNodeMappedData';

export type ClickedNodeData = NodeDataResult & {
  intersection: CadIntersection;
};

export const useClickedNode = (
  fdmConfig?: FdmAssetMappingsConfig | undefined
): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        if (event === undefined) {
          return;
        }

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

  const nodeData = useNodeMappedData(cadIntersection?.treeIndex, cadIntersection?.model, fdmConfig);

  if (nodeData === undefined || cadIntersection === undefined) {
    return undefined;
  }
  return { intersection: cadIntersection, ...nodeData };
};
