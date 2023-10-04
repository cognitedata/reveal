/*!
 * Copyright 2023 Cognite AS
 */

import { type CadIntersection, type PointerEventData } from '@cognite/reveal';
import { type DmsUniqueIdentifier, type Source, useReveal } from '../';
import { useEffect, useState } from 'react';
import { useFdm3dNodeDataPromises } from '../components/NodeCacheProvider/NodeCacheProvider';
import { AssetMapping3D, CogniteInternalId, type Node3D } from '@cognite/sdk';
import {
  type CadNodeWithFdmIds,
  type FdmNodeDataPromises
} from '../components/NodeCacheProvider/types';
import { useAssetMappingForTreeIndex } from '../components/NodeCacheProvider/AssetMappingCacheProvider';

export type AssetMappingDataResult = {
  type: 'cad-assetmapping',
  cadNode?: Node3D,
  assetIds?: CogniteInternalId[]
};

export type FdmNodeDataResult = {
  type: 'cad-datamodel',
  fdmNode?: DmsUniqueIdentifier;
  view?: Source;
  cadNode?: Node3D;
};

export type ClickedNodeData = (FdmNodeDataResult | AssetMappingDataResult) & {
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

  useEffect(() => {
    void setClickedNodeFromQueryResult(nodeDataPromises, assetMappingResult);

    async function setClickedNodeFromQueryResult(
      promises: FdmNodeDataPromises | undefined,
      assetMappingResult: { node: Node3D, mappings: AssetMapping3D[] } | undefined
    ): Promise<void> {
      if (promises === undefined && assetMappingResult == undefined) {
        return;
      }

      if (cadIntersection === undefined) {
        setClickedNodeData(undefined);
        return;
      }

      setClickedNodeData({
        type: promises !== undefined ? 'cad-datamodel' : 'cad-assetmapping',
        intersection: cadIntersection
      });

      if (promises !== undefined) {
        const cadAndFdmNodes = await promises.cadAndFdmNodesPromise;

        if (cadAndFdmNodes === undefined || cadAndFdmNodes.fdmIds.length === 0) {
          return;
        }

        setClickedNodeData({
          type: 'cad-datamodel',
          intersection: cadIntersection,
          fdmNode: cadAndFdmNodes.fdmIds[0],
          cadNode: cadAndFdmNodes.cadNode
        });

        await setClickedNodeFromViewPromise(cadAndFdmNodes, promises.viewsPromise);
      } else if (assetMappingResult !== undefined) {
        console.log('AAAAH');
        setClickedNodeData({
          type: 'cad-assetmapping',
          intersection: cadIntersection,
          assetIds: assetMappingResult.mappings.map(mapping => mapping.assetId),
          cadNode: assetMappingResult.node
        });
      }
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
        type: 'cad-datamodel',
        intersection: cadIntersection,
        fdmNode: data.fdmIds[0],
        cadNode: data.cadNode,
        view: views[0]
      });
    }
  }, [nodeDataPromises, assetMappingResult]);

  return clickedNodeData;
};
