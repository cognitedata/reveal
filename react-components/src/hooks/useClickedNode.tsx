/*!
 * Copyright 2023 Cognite AS
 */

import {
  type PointCloudIntersection,
  type CadIntersection,
  type PointerEventData
} from '@cognite/reveal';
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeDataPromises } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type FdmNodeDataPromises } from '../components/NodeCacheProvider/types';
import { useAssetMappingForTreeIndex } from '../components/NodeCacheProvider/AssetMappingCacheProvider';
import { type NodeAssetMappingResult } from '../components/NodeCacheProvider/AssetMappingCache';

export type AssetMappingDataResult = {
  cadNode: Node3D;
  assetIds: CogniteInternalId[];
};

export type FdmNodeDataResult = {
  fdmNodes: DmsUniqueIdentifier[];
  cadNode: Node3D;
  views?: Source[];
};

export type ClickedNodeData = {
  fdmResult?: FdmNodeDataResult;
  assetMappingResult?: AssetMappingDataResult;
  intersection: CadIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);
  const [pointCloudIntersection, setPointCloudIntersection] = useState<
    PointCloudIntersection | undefined
  >(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const intersection = await viewer.getIntersectionFromPixel(event.offsetX, event.offsetY);

        if (intersection?.type === 'cad') {
          setCadIntersection(intersection);
        } else if (intersection?.type === 'pointcloud') {
          setPointCloudIntersection(intersection);
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

  const nodeDataPromises = useFdm3dNodeDataPromises(
    cadIntersection?.model.modelId,
    cadIntersection?.model.revisionId,
    cadIntersection?.treeIndex
  ).data;

  const assetMappingResult = useAssetMappingForTreeIndex(
    cadIntersection?.model.modelId,
    cadIntersection?.model.revisionId,
    cadIntersection?.treeIndex
  ).data;

  return useCombinedClickedNodeData(nodeDataPromises, assetMappingResult, cadIntersection);
};

const useCombinedClickedNodeData = (
  fdmPromises: FdmNodeDataPromises | undefined,
  assetMappings: NodeAssetMappingResult | undefined,
  cadIntersection: CadIntersection | undefined
): ClickedNodeData | undefined => {
  const [clickedNodeData, setClickedNodeData] = useState<ClickedNodeData | undefined>();
  const fdmData = useFdmData(fdmPromises);

  useEffect(() => {
    if (cadIntersection === undefined) {
      setClickedNodeData(undefined);
      return;
    }

    const assetMappingData =
      assetMappings?.node === undefined
        ? undefined
        : {
            cadNode: assetMappings.node,
            assetIds: assetMappings.mappings.map((mapping) => mapping.assetId)
          };

    setClickedNodeData({
      fdmResult: fdmData,
      assetMappingResult: assetMappingData,
      intersection: cadIntersection
    });
  }, [cadIntersection, fdmData, assetMappings?.node]);

  return clickedNodeData;
};

const useFdmData = (
  fdmPromises: FdmNodeDataPromises | undefined
): FdmNodeDataResult | undefined => {
  const [fdmData, setFdmData] = useState<FdmNodeDataResult | undefined>();

  useEffect(() => {
    if (fdmPromises === undefined) {
      setFdmData(undefined);
      return;
    }

    void setData(fdmPromises);

    async function setData(promises: FdmNodeDataPromises): Promise<void> {
      const cadAndFdmNodes = await promises.cadAndFdmNodesPromise;

      if (cadAndFdmNodes === undefined || cadAndFdmNodes.fdmIds.length === 0) {
        setFdmData(undefined);
        return;
      }

      setFdmData({
        fdmNodes: cadAndFdmNodes.fdmIds,
        cadNode: cadAndFdmNodes.cadNode
      });

      const views = await promises.viewsPromise;

      if (views === undefined || views.length === 0) {
        return;
      }

      setFdmData({
        fdmNodes: cadAndFdmNodes.fdmIds,
        cadNode: cadAndFdmNodes.cadNode,
        views
      });
    }
  }, [fdmPromises]);

  return fdmData;
};
