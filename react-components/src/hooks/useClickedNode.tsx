import {
  type PointerEventData,
  type Image360AnnotationIntersection,
  type AnyIntersection,
  type DataSourceType
} from '@cognite/reveal';
import { useContext, useEffect, useMemo, useState } from 'react';
import { type FdmNodeDataPromises } from '../components/CacheProvider/types';
import {
  type AssetMappingDataResult,
  type ClickedNodeData,
  type FdmNodeDataResult,
  type PointCloudAnnotationMappedAssetData
} from './types';
import { MOUSE, Vector2, type Vector3 } from 'three';
import { type PointCloudFdmVolumeMappingWithViews } from '../query/core-dm/usePointCloudDMVolumeMappingForAssetInstances';
import { type UseQueryResult } from '@tanstack/react-query';
import { type HybridCadNodeAssetMappingResult } from '../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import {
  isClassicCadAssetMapping,
  isDmCadAssetMapping
} from '../components/CacheProvider/cad/assetMappingTypes';
import { UseClickedNodeDataContext } from './useClickedNode.context';

export const useClickedNodeData = (options?: {
  leftClick?: boolean;
  rightClick?: boolean;
  disableOnEditTool?: boolean;
}): ClickedNodeData | undefined => {
  const {
    useFdm3dNodeDataPromises,
    useAssetMappingForTreeIndex,
    usePointCloudAnnotationMappingForIntersection,
    usePointCloudFdmVolumeMappingForIntersection,
    useRenderTarget,
    useReveal,
    isActiveEditTool
  } = useContext(UseClickedNodeDataContext);

  const leftClick = options?.leftClick ?? true;
  const rightClick = options?.rightClick ?? false;
  const disableOnEditTool = options?.disableOnEditTool ?? true;

  const viewer = useReveal();
  const renderTarget = useRenderTarget();

  const [intersection, setIntersection] = useState<AnyIntersection | undefined>(undefined);

  const [image360AnnotationIntersection, setImage360AnnotationIntersection] = useState<
    Image360AnnotationIntersection<DataSourceType> | undefined
  >(undefined);

  const [position, setPosition] = useState<Vector2 | undefined>(undefined);
  const [mouseButton, setMouseButton] = useState<MOUSE | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const activatedOnLeftClick = leftClick && event.button === MOUSE.LEFT;
        const activatedOnRightClick = rightClick && event.button === MOUSE.RIGHT;

        if (
          !(activatedOnLeftClick || activatedOnRightClick) ||
          (disableOnEditTool && isActiveEditTool(renderTarget.commandsController))
        ) {
          setPosition(undefined);
          setMouseButton(undefined);
          return;
        }

        const position = new Vector2(event.offsetX, event.offsetY);

        setPosition(position);
        setMouseButton(event.button);

        const intersection = await viewer.getAnyIntersectionFromPixel(position);

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
          setImage360AnnotationIntersection(annotationIntersection);
        } else {
          setImage360AnnotationIntersection(undefined);
        }
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const { data: nodeDataPromises } = useFdm3dNodeDataPromises(intersection);

  const { data: hybridAssetMappingResult } = useAssetMappingForTreeIndex(intersection);

  const pointCloudAnnotationMappingResult =
    usePointCloudAnnotationMappingForIntersection(intersection);

  const pointCloudFdmVolumeMappingResult =
    usePointCloudFdmVolumeMappingForIntersection(intersection);

  return useCombinedClickedNodeData(
    mouseButton,
    position,
    nodeDataPromises,
    hybridAssetMappingResult,
    pointCloudAnnotationMappingResult,
    pointCloudFdmVolumeMappingResult,
    image360AnnotationIntersection ?? intersection
  );
};

const useCombinedClickedNodeData = (
  mouseButton: MOUSE | undefined,
  position: Vector2 | undefined,
  fdmPromises: FdmNodeDataPromises | undefined,
  hybridAssetMappings: HybridCadNodeAssetMappingResult | undefined,
  pointCloudAssetMappingsResult: UseQueryResult<PointCloudAnnotationMappedAssetData[]>,
  pointCloudFdmVolumeMappingsResult: UseQueryResult<PointCloudFdmVolumeMappingWithViews[]>,
  intersection: AnyIntersection | Image360AnnotationIntersection<DataSourceType> | undefined
): ClickedNodeData | undefined => {
  const fdmData = useFdmData(fdmPromises);

  return useMemo(() => {
    if (intersection === undefined) {
      return undefined;
    }

    const combinedFdmCadData = combineFdmCadData(hybridAssetMappings, fdmData);
    const filteredClassicCadData = extractClassicCadData(hybridAssetMappings);

    const pointCloudAssetMappings = normalizeListDataResult(pointCloudAssetMappingsResult);
    const pointCloudFdmVolumeMappings = normalizeListDataResult(pointCloudFdmVolumeMappingsResult);

    return {
      mouseButton,
      position,
      fdmResult: combinedFdmCadData,
      assetMappingResult: filteredClassicCadData,
      pointCloudAnnotationMappingResult: pointCloudAssetMappings,
      pointCloudFdmVolumeMappingResult: pointCloudFdmVolumeMappings,
      intersection
    };
  }, [
    intersection,
    fdmData,
    hybridAssetMappings?.node,
    pointCloudAssetMappingsResult.data,
    pointCloudAssetMappingsResult.isFetching,
    pointCloudFdmVolumeMappingsResult.data,
    pointCloudFdmVolumeMappingsResult.isFetching
  ]);

  function normalizeListDataResult<T>(result: UseQueryResult<T[]>): T[] | undefined | null {
    return result.isFetching
      ? undefined
      : result.data === undefined || result.data.length === 0
        ? null
        : result.data;
  }
};

const useFdmData = (
  fdmPromises: FdmNodeDataPromises | undefined
): FdmNodeDataResult | undefined | null => {
  const [fdmData, setFdmData] = useState<FdmNodeDataResult | undefined | null>();

  useEffect(() => {
    if (fdmPromises === undefined) {
      setFdmData(undefined);
      return;
    }

    void setData(fdmPromises);

    async function setData(promises: FdmNodeDataPromises): Promise<void> {
      const cadAndFdmNodes = await promises.cadAndFdmNodesPromise;

      if (cadAndFdmNodes === undefined || cadAndFdmNodes.fdmIds.length === 0) {
        setFdmData(null);
        return;
      }

      setFdmData({
        fdmNodes: cadAndFdmNodes.fdmIds,
        cadNode: cadAndFdmNodes.cadNode,
        views: undefined
      });

      const views = await promises.viewsPromise;

      if (views === undefined || views.length === 0) {
        setFdmData({
          fdmNodes: cadAndFdmNodes.fdmIds,
          cadNode: cadAndFdmNodes.cadNode,
          views: null
        });
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

export function getClickedNodeDataIntersectionPosition(
  clickedNodeData: ClickedNodeData
): Vector3 | undefined {
  const intersection = clickedNodeData.intersection;
  if (intersection !== undefined && intersection.type === 'image360Annotation') {
    return undefined;
  }

  return intersection.point;
}

function combineFdmCadData(
  hybridData: HybridCadNodeAssetMappingResult | undefined,
  fdmData: FdmNodeDataResult | undefined | null
): FdmNodeDataResult | undefined | null {
  if (
    hybridData !== undefined &&
    hybridData.node !== undefined &&
    hybridData.mappings.some(isDmCadAssetMapping)
  ) {
    const instances = hybridData.mappings
      .filter(isDmCadAssetMapping)
      .map((mapping) => mapping.instanceId);
    return { cadNode: hybridData.node, fdmNodes: instances };
  }

  if (fdmData !== null && fdmData !== undefined) {
    return fdmData;
  }

  if (fdmData === undefined || hybridData === undefined) {
    return undefined;
  }

  return null;
}

function extractClassicCadData(
  hybridData: HybridCadNodeAssetMappingResult | undefined
): AssetMappingDataResult | undefined | null {
  if (hybridData === undefined) {
    return undefined;
  }

  if (hybridData.node === undefined) {
    return null;
  }

  return {
    cadNode: hybridData.node,
    assetIds: hybridData.mappings.filter(isClassicCadAssetMapping).map((mapping) => mapping.assetId)
  };
}
