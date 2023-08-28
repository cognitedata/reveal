import { useEffect } from 'react';

import {
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import { setCurrentZoomScale } from '../state/useIndustrialCanvasStore';

const useSyncCurrentZoomScale = (unifiedViewerRef: UnifiedViewer | null) => {
  useEffect(() => {
    if (unifiedViewerRef === null) {
      return;
    }
    setCurrentZoomScale(unifiedViewerRef.getScale());
    unifiedViewerRef.addEventListener(
      UnifiedViewerEventType.ON_ZOOM_CHANGE,
      setCurrentZoomScale
    );

    return () => {
      unifiedViewerRef.removeEventListener(
        UnifiedViewerEventType.ON_ZOOM_CHANGE,
        setCurrentZoomScale
      );
    };
  }, [unifiedViewerRef]);
};

export default useSyncCurrentZoomScale;
