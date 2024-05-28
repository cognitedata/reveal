/*!
 * Copyright 2023 Cognite AS
 */

import {
  type PointerEventData,
  type Image360AnnotationIntersection,
  AnyIntersection
} from '@cognite/reveal';
import { useEffect, useState } from 'react';
import { useFdm3dNodeDataPromises } from '../components/CacheProvider/NodeCacheProvider';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type FdmNodeDataPromises } from '../components/CacheProvider/types';
import { useAssetMappingForTreeIndex } from '../components/CacheProvider/AssetMappingCacheProvider';
import { type NodeAssetMappingResult } from '../components/CacheProvider/AssetMappingCache';
import { usePointCloudAnnotationMappingForAssetId } from '../components/CacheProvider/PointCloudAnnotationCacheProvider';
import { type PointCloudAnnotationMappedAssetData } from './types';
import { MOUSE, Vector2 } from 'three';
import { type DmsUniqueIdentifier, type Source } from '../utilities/FdmSDK';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

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
  pointCloudAnnotationMappingResult?: PointCloudAnnotationMappedAssetData[];
  intersection: AnyIntersection | Image360AnnotationIntersection;
};

export const useClickedNodeData = (): ClickedNodeData | undefined => {
  const viewer = useReveal();

  const [intersection, setIntersection] = useState<AnyIntersection | undefined>(undefined);

  const [annotationIntersection, setAnnotationIntersection] = useState<
    Image360AnnotationIntersection | undefined
  >(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        if (event.button !== MOUSE.LEFT) {
          return;
        }

        const intersection = await viewer.getAnyIntersectionFromPixel(
          new Vector2(event.offsetX, event.offsetY)
        );

        const annotationIntersection = await viewer.get360AnnotationIntersectionFromPixel(
          event.offsetX,
          event.offsetY
        );

        if (intersection !== undefined) {
          setIntersection(intersection);
        } else {
          setIntersection(undefined);
        }

        if (annotationIntersection !== null) {
          setAnnotationIntersection(annotationIntersection);
        } else {
          setAnnotationIntersection(undefined);
        }
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const { data: nodeDataPromises } = useFdm3dNodeDataPromises(intersection);

  const { data: assetMappingResult } = useAssetMappingForTreeIndex(intersection);

  const { data: pointCloudAssetMappingResult } =
    usePointCloudAnnotationMappingForAssetId(intersection);

  return useCombinedClickedNodeData(
    nodeDataPromises,
    assetMappingResult,
    pointCloudAssetMappingResult,
    annotationIntersection ?? intersection
  );
};

const useCombinedClickedNodeData = (
  fdmPromises: FdmNodeDataPromises | undefined,
  assetMappings: NodeAssetMappingResult | undefined,
  pointCloudAssetMappings: PointCloudAnnotationMappedAssetData[] | undefined,
  intersection: AnyIntersection | Image360AnnotationIntersection | undefined
): ClickedNodeData | undefined => {
  const [clickedNodeData, setClickedNodeData] = useState<ClickedNodeData | undefined>();
  const fdmData = useFdmData(fdmPromises);

  useEffect(() => {
    if (intersection === undefined) {
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
      pointCloudAnnotationMappingResult: pointCloudAssetMappings,
      intersection
    });
  }, [intersection, fdmData, assetMappings?.node, pointCloudAssetMappings]);

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
