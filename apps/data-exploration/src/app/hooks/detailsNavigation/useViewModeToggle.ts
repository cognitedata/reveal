import { useCallback, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';

import { VIEW_MODE_FIELD } from '@data-exploration-lib/core';

import { useJourney } from './useJourney';

// Toggles if details overlay should be full-page or not
// viewMode=true => full-page
// viewMode=false => half-page
// viewMode=undefined => there is no journey
export const useViewModeToggle = (): [
  boolean | undefined,
  (isFullScreen: boolean) => void
] => {
  const { search, pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [journey] = useJourney();

  const [viewMode, setViewMode] = useState<boolean | undefined>(() => {
    if (isEmpty(journey) || journey === undefined) return undefined;
    if (searchParams.has(VIEW_MODE_FIELD)) return true;
    return false;
  });

  const setOverlayViewMode = useCallback(
    (isFullScreen: boolean) => {
      // Using 'searchParams` from the 'useSearchParams' hook is not a viable option here.
      // https://github.com/remix-run/react-router/issues/9757
      const params = new URLSearchParams(window.location.search);

      if (isFullScreen) {
        params.set(VIEW_MODE_FIELD, 'true');
        setViewMode(true);
      }
      if (!isFullScreen || isEmpty(journey) || journey === undefined) {
        params.delete(VIEW_MODE_FIELD);
        setViewMode(false);
      }

      setSearchParams(() => {
        return params;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, pathname]
  );

  return [viewMode, setOverlayViewMode];
};
