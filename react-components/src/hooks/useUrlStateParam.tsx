/*!
 * Copyright 2023 Cognite AS
 */

type SlicerUrlStateParam = {
  top: number;
  bottom: number;
};

export type UrlStateParamActions = {
  getSlicerStateFromUrlParam: () => SlicerUrlStateParam;
  setUrlParamOnSlicerChanged: (top: number, bottom: number) => void;
};

export const useUrlStateParam = (): UrlStateParamActions => {
  const url = new URL(window.location.toString());

  const getSlicerStateFromUrlParam = (): SlicerUrlStateParam => {
    const top = url.searchParams.get('slicerTop');
    const bottom = url.searchParams.get('slicerBottom');

    const parsedTop = top !== null && top !== undefined ? getParsedNumber(top) : 1;
    const parsedBottom = bottom !== null && bottom !== undefined ? getParsedNumber(bottom) : 0;

    return { top: parsedTop as number, bottom: parsedBottom as number };
  };

  const setUrlParamOnSlicerChanged = (top: number, bottom: number): void => {
    url.searchParams.set('slicerTop', `[${top}]`);
    url.searchParams.set('slicerBottom', `[${bottom}]`);
    window.history.pushState({}, '', url);
  };

  function getParsedNumber(s: string): number | undefined {
    try {
      return parseFloat(JSON.parse(s));
    } catch (e) {
      return undefined;
    }
  }

  return {
    getSlicerStateFromUrlParam,
    setUrlParamOnSlicerChanged
  };
};
