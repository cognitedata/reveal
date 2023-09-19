/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type Node3D } from '@cognite/sdk';
import { FdmNodeDataPromises } from '../components/NodeCacheProvider/types';

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};

export type ClickedNodeData = Partial<NodeDataResult> & {
  intersection: CadIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);
  const [clickedNodeData, setClickedNodeData] = useState<ClickedNodeData | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);

        if (intersection?.type === 'cad') {
          setCadIntersection(intersection);
        } else {
          setCadIntersection(undefined);
        }
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const nodeData = useFdm3dNodeData(
    cadIntersection?.model.modelId,
    cadIntersection?.model.revisionId,
    cadIntersection?.treeIndex
  ).data;

  useEffect(() => {
    if (isWaitingForQueryResult()) {
      return;
    }

    unwrapQueryResult(nodeData);
    async function unwrapQueryResult(promises: FdmNodeDataPromises | undefined): Promise<void> {

      if (promises === undefined) {
        return;
      }

      const cadAndFdmNode = await promises.cadAndFdmNodesPromise;

      if (cadIntersection === undefined) {
        setClickedNodeData(undefined);
        return;
      }

      if (cadAndFdmNode === undefined || cadAndFdmNode.fdmIds.length === 0) {
        setClickedNodeData({
          intersection: cadIntersection
        });
        return;
      }

      const views = await promises.viewsPromise;

      if (views === undefined) {
        setClickedNodeData({
          intersection: cadIntersection,
          fdmNode: cadAndFdmNode.fdmIds[0],
          cadNode: cadAndFdmNode.cadNode
        });
        return;
      }

      setClickedNodeData({
        intersection: cadIntersection,
        fdmNode: cadAndFdmNode.fdmIds[0],
        cadNode: cadAndFdmNode.cadNode,
        view: views[0],
      });
    }

    function isWaitingForQueryResult(): boolean {
      return nodeData === undefined && cadIntersection !== undefined;
    }
  }, [nodeData]);

  return clickedNodeData;
};
