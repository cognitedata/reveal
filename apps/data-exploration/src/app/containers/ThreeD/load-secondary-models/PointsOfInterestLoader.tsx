import { useEffect, useMemo, useRef, useState } from 'react';

import {
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { Vector3 } from 'three';

import {
  Cognite3DViewer,
  OverlayCollection,
  HtmlOverlayTool,
  Overlay3DTool,
  OverlayEventHandler,
  Overlay3D,
} from '@cognite/reveal';

import {
  PointsOfInterestCollection,
  getPointsOfInterestsAppliedStateQueryKey,
  getPointsOfInterestsQueryFn,
  POINTS_OF_INTEREST_BASE_QUERY_KEY,
} from '@data-exploration-app/containers/ThreeD/hooks';

import {
  PointOfInterestOverlayData,
  PointsOfInterestOverlay,
} from '../components/PointsOfInterestOverlay';
import { SecondaryObjectsVisibilityState } from '../contexts/ThreeDContext';

type PointsOfInterestLoaderProps = {
  poiList: PointsOfInterestCollection[];
  viewer: Cognite3DViewer;
  secondaryObjectsVisibilityState?: SecondaryObjectsVisibilityState;
};

export type PointsOfInterestOverlayCollectionType = {
  poiCollectionExternalId: string;
  poiIndex: number;
};

export type PointsOfInterestOverlayCollection = {
  externalId: string;
  overlays?: OverlayCollection<PointsOfInterestOverlayCollectionType>;
};

const PointsOfInterestLoader = ({
  poiList: pointsOfInterestList,
  viewer,
  secondaryObjectsVisibilityState,
}: PointsOfInterestLoaderProps): JSX.Element => {
  const [currentPOIData, setCurrentPOIData] =
    useState<PointOfInterestOverlayData>({
      title: 'Title',
      description: 'Description',
      imageExternalIds: [],
    });

  const [displayPOIOverlay, setDisplayPOIOverlay] = useState<boolean>(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  const onPOIClick = (clickInfo: {
    targetOverlay: Overlay3D<PointsOfInterestOverlayCollectionType>;
    htmlTextOverlay: HTMLElement;
    mousePosition: {
      offsetX: number;
      offsetY: number;
    };
  }) => {
    const metaData = clickInfo.targetOverlay.getContent();
    if (metaData === undefined) return;

    const { poiCollectionExternalId, poiIndex } = metaData;

    setDisplayPOIOverlay(true);

    const poiCollection = pointsOfInterestList.find(
      (collection) => collection.externalId === poiCollectionExternalId
    );

    if (
      poiCollection === undefined ||
      poiCollection?.pointsOfInterest === undefined
    ) {
      return;
    }

    const poi = poiCollection?.pointsOfInterest[poiIndex];
    const poiOverlayData: PointOfInterestOverlayData = {
      title: poi.title ?? 'No title',
      description: poi.description ?? 'No description',
      imageExternalIds: poi.fileIds,
    };
    const threedPosition: Vector3 = new Vector3(
      poi.position.x,
      poi.position.y,
      poi.position.z
    );

    if (overlayRef !== null && overlayRef.current !== null) {
      htmlOverlayTool.clear();
      htmlOverlayTool.add(overlayRef.current, threedPosition, undefined);
    }

    setCurrentPOIData(poiOverlayData);
  };

  const htmlOverlayTool = useMemo<HtmlOverlayTool>(() => {
    return new HtmlOverlayTool(viewer);
  }, [viewer]);

  const overlayTool = useRef<
    Overlay3DTool<PointsOfInterestOverlayCollectionType>
  >(new Overlay3DTool<PointsOfInterestOverlayCollectionType>(viewer));

  const overlayToolOnClick =
    useRef<OverlayEventHandler<PointsOfInterestOverlayCollectionType> | null>(
      null
    );

  const pointsOfInterestOverlayCollection = useRef<
    PointsOfInterestOverlayCollection[]
  >([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (overlayToolOnClick.current !== null) {
      overlayTool.current?.off('click', overlayToolOnClick.current);
    }

    overlayToolOnClick.current = onPOIClick;

    overlayTool.current.on('click', overlayToolOnClick.current);
  }, [onPOIClick]);

  useEffect(() => {
    if (secondaryObjectsVisibilityState !== undefined) {
      overlayTool.current.setVisible(
        secondaryObjectsVisibilityState.pointsOfInterest.valueOf()
      );
    }
  }, [secondaryObjectsVisibilityState]);

  useQueries<
    UseQueryOptions<
      boolean | undefined,
      undefined,
      boolean | undefined,
      (
        | string
        | number
        | boolean
        | { siteId: string; checklistWithItems: PointsOfInterestCollection }[]
        | undefined
      )[]
    >[]
  >({
    queries: pointsOfInterestList.map((pointsOfInterest) => ({
      queryKey: getPointsOfInterestsAppliedStateQueryKey(
        pointsOfInterest.externalId,
        pointsOfInterest.applied
      ),
      queryFn: getPointsOfInterestsQueryFn(
        queryClient,
        overlayTool.current,
        pointsOfInterest,
        pointsOfInterestOverlayCollection.current
      ),
    })),
  });

  const onClose = () => {
    setDisplayPOIOverlay(false);
  };

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries([POINTS_OF_INTEREST_BASE_QUERY_KEY]);
    };
  }, [queryClient]);

  return (
    <div
      style={{
        position: 'absolute',
      }}
      ref={overlayRef}
    >
      <PointsOfInterestOverlay
        pointOfInterestData={currentPOIData}
        onClose={onClose}
        visible={displayPOIOverlay}
      ></PointsOfInterestOverlay>
    </div>
  );
};

export default PointsOfInterestLoader;
