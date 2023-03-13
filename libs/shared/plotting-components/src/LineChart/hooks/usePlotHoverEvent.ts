import { useEffect, useState } from 'react';

import { PlotHoverEvent } from 'plotly.js';

import head from 'lodash/head';

import { createEventListener } from '../utils/createEventListener';

export interface Props {
  chartRef: React.RefObject<HTMLDivElement>;
  isCursorOnPlot: boolean;
  isContinuousHover: boolean;
}

export const usePlotHoverEvent = ({
  chartRef,
  isCursorOnPlot,
  isContinuousHover,
}: Props) => {
  const [isPlotHovered, setPlotHovered] = useState(false);
  const [preventClearEvent, setPreventClearEvent] = useState(false);
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();
  const [plotHoverEventBackup, setPlotHoverEventBackup] =
    useState<PlotHoverEvent>();

  const updatePlotHoverEvent = (event: PlotHoverEvent) => {
    setPlotHoverEvent(event);
    setPlotHovered(true);
  };

  const setPlotUnhovered = () => {
    setPlotHovered(false);
  };

  useEffect(() => {
    ['hover-layer', 'tooltip'].forEach((className) => {
      const element = head(chartRef.current?.getElementsByClassName(className));

      createEventListener(element, 'mouseenter', () => {
        setPreventClearEvent(true);
      });
      createEventListener(element, 'mouseleave', () => {
        setPreventClearEvent(false);
      });
    });
  }, [chartRef]);

  useEffect(() => {
    if (!isCursorOnPlot) {
      setPlotHoverEvent(undefined);
      return;
    }

    if (!isContinuousHover && !isPlotHovered && !preventClearEvent) {
      setPlotHoverEvent(undefined);
      return;
    }
  }, [isContinuousHover, preventClearEvent, isCursorOnPlot, isPlotHovered]);

  useEffect(() => {
    const plot = head(
      chartRef.current?.getElementsByClassName('nsewdrag drag')
    );

    createEventListener(plot, 'mousedown', () => {
      setPlotHoverEventBackup(plotHoverEvent);
      setPlotHoverEvent(undefined);
    });
    createEventListener(plot, 'mouseup', () => {
      setPlotHoverEvent(plotHoverEventBackup);
      setPlotHoverEventBackup(undefined);
    });
  }, [chartRef, plotHoverEvent, plotHoverEventBackup]);

  return {
    plotHoverEvent,
    updatePlotHoverEvent,
    setPlotUnhovered,
  };
};
