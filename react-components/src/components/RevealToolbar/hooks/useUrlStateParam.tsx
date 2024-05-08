/*!
 * Copyright 2023 Cognite AS
 */

import { useCallback, useMemo } from 'react';

type SearchParamsHookResult = {
  url: URL;
  searchParams: URLSearchParams;
};

const useSearchParams = (): SearchParamsHookResult => {
  const url = new URL(window.location.toString());
  const searchParams = useMemo(() => url.searchParams, [url]);
  return { url, searchParams };
};

export enum ParamKeys {
  SlicerState = 'slicerState',
  CadLayersState = 'cadLayersState',
  PointCloudLayersState = 'pointCloudLayersState',
  Image360LayersState = 'image360LayersState'
}

export const useSlicerUrlParams = (): [
  { top: number; bottom: number },
  (slicerBottomTop: number[]) => void
] => {
  const { url, searchParams } = useSearchParams();

  const slicerUrlState = useMemo(() => {
    const bottomTop = searchParams.get(ParamKeys.SlicerState);

    if (bottomTop !== null && bottomTop !== undefined) {
      const [bottom, top] = JSON.parse(bottomTop);
      return { bottom, top };
    }

    return { bottom: 0, top: 1 };
  }, [searchParams]);

  const setSlicerUrlState = useCallback(
    (slicerBottomTop: number[]) => {
      searchParams.set(ParamKeys.SlicerState, JSON.stringify(slicerBottomTop));
      window.history.pushState({}, '', url);
    },
    [searchParams]
  );

  return [slicerUrlState, setSlicerUrlState];
};
