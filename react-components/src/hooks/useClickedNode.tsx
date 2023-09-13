/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
<<<<<<< Updated upstream
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type Node3D } from '@cognite/sdk';

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};
=======
import { useReveal, type NodeDataResult, type DmsUniqueIdentifier } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeData } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type FdmNodeDataPromises } from '../components/NodeCacheProvider/types';
import { type Node3D } from '@cognite/sdk/dist/src';
>>>>>>> Stashed changes

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
    void awaitAndSetClickedNodedataWithDeferredViews(nodeData);

    async function awaitAndSetClickedNodedataWithDeferredViews(
      promises: FdmNodeDataPromises | undefined
    ): Promise<void> {
      if (cadIntersection === undefined || promises === undefined) {
        setClickedNodeData(undefined);
        return;
      }

      const nodeData = await promises.cadNodeAndFdmIdPromise;
      const fdmNodeList = nodeData?.fdmIds ?? [];

      if (nodeData === undefined || fdmNodeList.length === 0) {
        setClickedNodeData({
          intersection: cadIntersection
        });
        return;
      }

      const chosenNode = fdmNodeList[0];

      setClickedNodeData({
        intersection: cadIntersection,
        cadNode: nodeData.cadNode,
        fdmNode: chosenNode,
        view: undefined
      });

      await setViewForClickedData(cadIntersection, chosenNode, nodeData.cadNode, promises);
    }

    async function setViewForClickedData(
      cadIntersection: CadIntersection,
      fdmNode: DmsUniqueIdentifier,
      cadNode: Node3D,
      promises: FdmNodeDataPromises
    ): Promise<void> {
      const views = await promises.viewsPromise;

<<<<<<< Updated upstream
    setClickedNodeData({
      intersection: cadIntersection,
      fdmNode: chosenNode.edge.startNode,
      view: chosenNode.view,
      cadNode: chosenNode.node
    });
=======
      if (views === undefined || views.length === 0) {
        return;
      }

      setClickedNodeData({
        intersection: cadIntersection,
        fdmNode,
        view: views[0],
        cadNode
      });
    }
>>>>>>> Stashed changes

    function isWaitingForQueryResult(): boolean {
      return nodeData === undefined && cadIntersection !== undefined;
    }
  }, [nodeData]);

  return clickedNodeData;
};
