import { useState } from 'react';

import head from 'lodash/head';

export const useIsCursorOnPlotArea = () => {
  const [isCursorOnPlotArea, setCursorOnPlotArea] = useState(false);

  const initializePlotAreaCursorDetector = (graph: HTMLElement) => {
    const plotArea = head(graph.getElementsByClassName('nsewdrag drag'));

    createEventListener(plotArea, 'mouseenter', () =>
      setCursorOnPlotArea(true)
    );
    createEventListener(plotArea, 'mouseleave', () =>
      setCursorOnPlotArea(false)
    );
  };

  return {
    isCursorOnPlotArea,
    initializePlotAreaCursorDetector,
  };
};

const createEventListener = (
  element: Element | undefined,
  type: string,
  listener: () => void
) => {
  if (!element) {
    return;
  }
  element.addEventListener(type, listener);
  return () => element.removeEventListener(type, listener);
};
