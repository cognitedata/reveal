/*!
 * Copyright 2023 Cognite AS
 */

type SlicerUrlStateParam = {
  top: number;
  bottom: number;
};

export type UrlStateParamActions = {
  getSlicerStateFromUrlParam: () => SlicerUrlStateParam;
  setUrlParamOnSlicerChanged: (slicerTopBottom: number[]) => void;
};

export const useUrlStateParam = (): UrlStateParamActions => {
  const url = new URL(window.location.toString());

  const getSlicerStateFromUrlParam = (): SlicerUrlStateParam => {
    const topBottom = url.searchParams.get('slicerState');
    if (topBottom === null || topBottom === undefined) {
      return { top: 1, bottom: 0 };
    }
    const [top, bottom] = JSON.parse(topBottom);

    return { top, bottom };
  };

  const setUrlParamOnSlicerChanged = (slicerTopBottom: number[]): void => {
    url.searchParams.set('slicerState', `[${slicerTopBottom.join(',')}]`);
    window.history.pushState({}, '', url);
  };

  return {
    getSlicerStateFromUrlParam,
    setUrlParamOnSlicerChanged
  };
};
