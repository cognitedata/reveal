import { useCallback, useEffect, useState } from 'react';

import head from 'lodash/head';
import { createEventListener } from '../utils/createEventListener';

export type Layer = 'plot' | 'hoverLayer' | 'tooltip';
export type HoverStatus = Record<Layer, boolean>;

export const useCursorHandler = () => {
  const [isCursorOnPlotArea, setCursorOnPlotArea] = useState(false);

  const [hoverStatus, setHoverStatus] = useState<HoverStatus>({
    plot: false,
    hoverLayer: false,
    tooltip: false,
  });

  const updateHoverStatus = (layer: Layer, status: boolean) => {
    setHoverStatus((current) => ({
      ...current,
      [layer]: status,
    }));
  };

  const hoverLayer = useCallback(
    (layer: Layer) => updateHoverStatus(layer, true),
    []
  );

  const unhoverLayer = useCallback(
    (layer: Layer) => updateHoverStatus(layer, false),
    []
  );

  const initializePlotLayerHandler = (graph: HTMLElement) => {
    const plotArea = head(graph.getElementsByClassName('nsewdrag drag'));

    createEventListener(plotArea, 'mouseenter', () => {
      hoverLayer('plot');
    });
    createEventListener(plotArea, 'mouseleave', () => {
      unhoverLayer('plot');
    });
  };

  useEffect(() => {
    const isCursorOnPlotArea = Object.values(hoverStatus).some(Boolean);
    setCursorOnPlotArea(isCursorOnPlotArea);
  }, [hoverStatus]);

  return {
    hoverStatus,
    isCursorOnPlotArea,
    initializePlotLayerHandler,
    hoverLayer,
    unhoverLayer,
  };
};
