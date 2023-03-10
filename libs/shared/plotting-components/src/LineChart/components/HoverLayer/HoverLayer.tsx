import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { getMarkerPosition } from '../../utils/getMarkerPosition';

import { HoverLayerWrapper } from './elements';
import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { HoverLineData, Layout } from '../../types';

import { HoverLine } from './HoverLine';
import { HoverLineInfo } from './HoverLineInfo';
import { HoverMarker } from './HoverMarker';
import { getPlotStyleData } from '../../utils/getPlotStyleData';
import { useCursorPosition } from '../../hooks/useCursorPosition';
import { useEffect, useState } from 'react';

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor?: string;
  isCursorOnPlotArea: boolean;
  onHover?: () => void;
  onUnhover?: () => void;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  plotHoverEvent: plotHoverEventCurrent,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  isCursorOnPlotArea,
  onHover,
  onUnhover,
  formatHoverLineInfo,
}) => {
  const { showHoverLine, showHoverLineInfo, showHoverMarker } = layout;

  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();

  const { cursorPosition } = useCursorPosition(chartRef);

  const markerPosition = getMarkerPosition(plotHoverEvent);
  const plotStyleData = getPlotStyleData(chartRef.current);

  useEffect(() => {
    if (plotHoverEventCurrent) {
      setPlotHoverEvent(plotHoverEventCurrent);
    }
  }, [plotHoverEventCurrent]);

  return (
    <HoverLayerWrapper
      style={{
        display: isCursorOnPlotArea ? 'initial' : 'none',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      <HoverLine
        isVisible={showHoverLine}
        position={cursorPosition}
        plotStyleData={plotStyleData}
      />

      <HoverLineInfo
        chartRef={chartRef}
        isVisible={showHoverLineInfo && Boolean(plotHoverEvent)}
        position={cursorPosition}
        plotStyleData={plotStyleData}
        plotHoverEvent={plotHoverEvent}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <HoverMarker
        isVisible={showHoverMarker && Boolean(plotHoverEvent)}
        position={markerPosition}
        plotHoverEvent={plotHoverEvent}
        backgroundColor={backgroundColor}
      />
    </HoverLayerWrapper>
  );
};
