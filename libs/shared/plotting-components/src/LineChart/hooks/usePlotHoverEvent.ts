import { useEffect, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

export const usePlotHoverEvent = () => {
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();
  const [isPlotHovered, setPlotHovered] = useState(false);
  const [isMarkerHovered, setMarkerHovered] = useState(false);

  useEffect(() => {
    if (!isPlotHovered && !isMarkerHovered) {
      setPlotHoverEvent(undefined);
    }
  }, [isPlotHovered, isMarkerHovered]);

  const onHoverPlot = (event: PlotHoverEvent) => {
    setPlotHoverEvent(event);
    setPlotHovered(true);
  };

  const plotHoverEventHandler = {
    onHoverPlot,
    onUnhoverPlot: () => setPlotHovered(false),
    onHoverMarker: () => setMarkerHovered(true),
    onUnhoverMarker: () => setMarkerHovered(false),
  };

  return {
    plotHoverEvent,
    plotHoverEventHandler,
  };
};
