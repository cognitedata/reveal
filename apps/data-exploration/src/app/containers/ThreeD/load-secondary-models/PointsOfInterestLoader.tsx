import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useQueries,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { Vector3 } from 'three';

import { usePrevious } from '@cognite/data-exploration';
import {
  Cognite3DViewer,
  OverlayCollection,
  HtmlOverlayTool,
  Overlay3DTool,
  Overlay3D,
} from '@cognite/reveal';

import {
  PointOfInterestOverlayData,
  PointsOfInterestOverlay,
} from '../components/PointsOfInterestOverlay';
import { SecondaryObjectsVisibilityState } from '../contexts/ThreeDContext';
import {
  getPointsOfInterestsAppliedStateQueryKey,
  getPointsOfInterestsQueryFn,
  POINTS_OF_INTEREST_BASE_QUERY_KEY,
  PointsOfInterestCollection,
} from '../hooks';

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

  const htmlOverlayTool = useMemo<HtmlOverlayTool>(
    () => new HtmlOverlayTool(viewer),
    [viewer]
  );

  const overlay3DTool = useMemo<
    Overlay3DTool<PointsOfInterestOverlayCollectionType>
  >(() => new Overlay3DTool(viewer), [viewer]);

  const onPointOfInterestClick = useCallback(
    (clickInfo: {
      targetOverlay: Overlay3D<PointsOfInterestOverlayCollectionType>;
      htmlTextOverlay: HTMLElement;
      mousePosition: {
        offsetX: number;
        offsetY: number;
      };
    }) => {
      const { poiCollectionExternalId, poiIndex } =
        clickInfo.targetOverlay.getContent();

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
      const threedPosition = new Vector3(
        poi.position.x,
        poi.position.y,
        poi.position.z
      );

      if (overlayRef.current !== null) {
        htmlOverlayTool.clear();
        htmlOverlayTool.add(overlayRef.current, threedPosition);
      }

      setDisplayPOIOverlay(true);
      setCurrentPOIData(poiOverlayData);
    },
    [
      setCurrentPOIData,
      setDisplayPOIOverlay,
      pointsOfInterestList,
      htmlOverlayTool,
    ]
  );

  const previousClickHandler = usePrevious(onPointOfInterestClick);

  const pointsOfInterestOverlayCollections = useRef<
    PointsOfInterestOverlayCollection[]
  >([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (overlayRef.current === null) return;

    const overlay = overlayRef.current;

    overlay.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });
  }, []);

  useEffect(() => {
    if (previousClickHandler) {
      overlay3DTool.off('click', previousClickHandler);
    }

    overlay3DTool.on('click', onPointOfInterestClick);
  }, [onPointOfInterestClick, previousClickHandler, overlay3DTool]);

  useEffect(() => {
    if (secondaryObjectsVisibilityState !== undefined) {
      overlay3DTool.setVisible(
        secondaryObjectsVisibilityState.pointsOfInterest
      );
    }
  }, [secondaryObjectsVisibilityState, overlay3DTool]);

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
        pointsOfInterest,
        pointsOfInterestOverlayCollections.current,
        overlay3DTool
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
      {displayPOIOverlay && (
        <PointsOfInterestOverlay
          pointOfInterestData={currentPOIData}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default PointsOfInterestLoader;
