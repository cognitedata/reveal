import { useEffect, useRef } from 'react';

import { MetricEvent } from '../constants';
import { SerializedCanvasDocument } from '../types';
import useMetrics from '../utils/tracking/useMetrics';

import { useUserProfileContext } from './use-query/useUserProfile';

const useTrackCanvasViewed = (
  activeCanvas: SerializedCanvasDocument | undefined
) => {
  const trackUsage = useMetrics();
  const { userProfile } = useUserProfileContext();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (activeCanvas === undefined || hasTrackedRef.current) {
      return;
    }
    hasTrackedRef.current = true;

    trackUsage(MetricEvent.CANVAS_VIEWED, {
      canvasExternalId: activeCanvas.externalId,
      currentUserId: userProfile.userIdentifier,
      canvasCreatedByUserId: activeCanvas.createdBy,
      canvasUpdatedByUserId: activeCanvas.updatedBy,
    });
  }, [activeCanvas, trackUsage, userProfile.userIdentifier]);
};

export default useTrackCanvasViewed;
