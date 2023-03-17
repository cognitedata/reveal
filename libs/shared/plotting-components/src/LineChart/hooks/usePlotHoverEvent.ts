import { useCallback, useEffect, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { createEventListener } from '../utils/createEventListener';

export interface Props {
  chartRef: React.RefObject<HTMLDivElement>;
  isCursorOnPlot: boolean;
  isContinuousHover: boolean;
  isPlotSelecting: boolean;
}

export const usePlotHoverEvent = ({
  chartRef,
  isCursorOnPlot,
  isContinuousHover,
  isPlotSelecting,
}: Props) => {
  const [isPlotHovered, setPlotHovered] = useState(false);
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();
  const [plotHoverEventBackup, setPlotHoverEventBackup] =
    useState<PlotHoverEvent>();

  const updatePlotHoverEvent = useCallback((event: PlotHoverEvent) => {
    setPlotHoverEvent(event);
    setPlotHovered(true);
  }, []);

  const setPlotUnhovered = useCallback(() => {
    setPlotHovered(false);
  }, []);

  useEffect(() => {
    createEventListener(chartRef.current, 'wheel', () => {
      setPlotHoverEvent(undefined);
    });
  }, [chartRef]);

  useEffect(() => {
    if (!isCursorOnPlot || (!isContinuousHover && !isPlotHovered)) {
      setPlotHoverEvent(undefined);
    }
  }, [isContinuousHover, isCursorOnPlot, isPlotHovered]);

  useEffect(() => {
    if (isPlotSelecting) {
      setPlotHoverEventBackup(plotHoverEvent);
      setPlotHoverEvent(undefined);
    } else {
      setPlotHoverEvent(plotHoverEventBackup);
      setPlotHoverEventBackup(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlotSelecting]);

  return {
    plotHoverEvent,
    updatePlotHoverEvent,
    setPlotUnhovered,
  };
};
