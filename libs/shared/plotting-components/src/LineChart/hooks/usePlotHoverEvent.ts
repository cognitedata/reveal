import { useEffect, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { HoverStatus } from './useCursorHandler';

export const usePlotHoverEvent = (hoverStatus: HoverStatus) => {
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();
  const [isPlotHovered, setPlotHovered] = useState(false);

  useEffect(() => {
    if (!isPlotHovered && !hoverStatus.hoverLayer && !hoverStatus.tooltip) {
      setPlotHoverEvent(undefined);
    }
  }, [isPlotHovered, hoverStatus.hoverLayer, hoverStatus.tooltip]);

  const onHoverPlot = (event: PlotHoverEvent) => {
    setPlotHoverEvent(event);
    setPlotHovered(true);
  };

  const plotHoverEventHandler = {
    onHoverPlot,
    onUnhoverPlot: () => setPlotHovered(false),
  };

  return {
    plotHoverEvent,
    plotHoverEventHandler,
  };
};
