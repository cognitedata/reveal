import { useCallback, useEffect, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { createEventListener } from '../utils/createEventListener';

export interface Props {
  chartRef: React.RefObject<HTMLDivElement>;
  isCursorOnPlot: boolean;
  isContinuousHover: boolean;
  isPlotSelecting?: boolean;
}

export const usePlotHoverEvent = ({
  chartRef,
  isCursorOnPlot,
  isContinuousHover,
  isPlotSelecting,
}: Props) => {
  const [isPlotHovered, setPlotHovered] = useState(false);
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();

  const updatePlotHoverEvent = useCallback((event: PlotHoverEvent) => {
    setPlotHoverEvent(event);
    setPlotHovered(true);
  }, []);

  const setPlotUnhovered = useCallback(() => {
    setPlotHovered(false);
  }, []);

  useEffect(() => {
    setPlotHoverEvent(undefined);
  }, [isPlotSelecting]);

  useEffect(() => {
    if (!isCursorOnPlot || (!isContinuousHover && !isPlotHovered)) {
      setPlotHoverEvent(undefined);
    }
  }, [isContinuousHover, isCursorOnPlot, isPlotHovered]);

  useEffect(() => {
    return createEventListener(chartRef.current, 'wheel', () => {
      setPlotHoverEvent(undefined);
    });
  }, [chartRef]);

  return {
    plotHoverEvent,
    updatePlotHoverEvent,
    setPlotUnhovered,
  };
};
