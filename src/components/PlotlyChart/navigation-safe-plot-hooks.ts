import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const useIsSafeToUpdateProps = () => {
  const [isSafeToUpdate, setIsAllowedToUpdate] = useState(true);

  /**
   * Debounced callback that turns on updates again (scrolling)
   */
  const allowUpdatesScroll = useDebouncedCallback(() => {
    setIsAllowedToUpdate(true);
  }, 100);

  /**
   * Debounced callback that turns on updates again (click and drag)
   */
  const allowUpdatesClick = useDebouncedCallback(() => {
    setIsAllowedToUpdate(true);
  }, 100);

  /**
   * Disallow updates when scrolling (Plotly.js doesn't handle scroll events correctly)
   */
  const handleMouseWheel = useCallback(() => {
    setIsAllowedToUpdate(false);
    allowUpdatesScroll();
    allowUpdatesClick.cancel();
  }, [allowUpdatesScroll, allowUpdatesClick]);

  useEffect(() => {
    window.addEventListener('mousewheel', handleMouseWheel);
    return () => {
      window.removeEventListener('mousewheel', handleMouseWheel);
    };
  }, [handleMouseWheel]);

  /**
   * Disallow updates when clicking and holding mouse (navigating plot)
   */
  const handleMouseDown = useCallback(() => {
    setIsAllowedToUpdate(false);
    allowUpdatesScroll.cancel();
  }, [allowUpdatesScroll]);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  });

  /**
   * Allow updates when releasing mouse button (no longer navigating plot)
   */
  const handleMouseUp = useCallback(() => {
    allowUpdatesClick();
  }, [allowUpdatesClick]);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return isSafeToUpdate;
};

export const useDebouncePropsOnNavigation = <P>(props: P): P => {
  /**
   * Optimization hook to avoid passing new component props when user is navigating (as this causes stuttering)
   */
  const isSafeToUpdate = useIsSafeToUpdateProps();

  /**
   * Local state for the active component props
   * that only updates when the user isn't doing any navigation
   */
  const [debouncedComponentProps, setDebouncedComponentProps] = useState(props);

  /**
   * Update active props whenever allowed (neither scrolling nor navigating)
   */
  useEffect(() => {
    if (isSafeToUpdate) {
      setDebouncedComponentProps(props);
    }
  }, [props, isSafeToUpdate]);

  return debouncedComponentProps;
};
