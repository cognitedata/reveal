/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type Node3D } from '@cognite/sdk';
import {
  type CadNodeWithFdmIds,
  type FdmNodeDataPromises
} from '../components/NodeCacheProvider/types';

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

    void setClickedNodeFromQueryResult(nodeData);
    async function setClickedNodeFromQueryResult(
      promises: FdmNodeDataPromises | undefined
    ): Promise<void> {
      if (promises === undefined) {
        return;
      }

      if (cadIntersection === undefined) {
        setClickedNodeData(undefined);
        return;
      }

      const cadAndFdmNodes = await promises.cadAndFdmNodesPromise;

      if (cadAndFdmNodes === undefined || cadAndFdmNodes.fdmIds.length === 0) {
        setClickedNodeData({
          intersection: cadIntersection
        });
        return;
      }

      setClickedNodeData({
        intersection: cadIntersection,
        fdmNode: cadAndFdmNodes.fdmIds[0],
        cadNode: cadAndFdmNodes.cadNode
      });

      await setClickedNodeFromViewPromise(cadAndFdmNodes, promises.viewsPromise);
    }

    async function setClickedNodeFromViewPromise(
      data: CadNodeWithFdmIds,
      viewsPromise: Promise<Source[] | undefined>
    ): Promise<void> {
      const views = await viewsPromise;

      if (views === undefined || views.length === 0 || cadIntersection === undefined) {
        return;
      }

      setClickedNodeData({
        intersection: cadIntersection,
        fdmNode: data.fdmIds[0],
        cadNode: data.cadNode,
        view: views[0]
      });
    }
    function isWaitingForQueryResult(): boolean {
      return nodeData === undefined && cadIntersection !== undefined;
    }
  }, [nodeData]);

  return clickedNodeData;
};
