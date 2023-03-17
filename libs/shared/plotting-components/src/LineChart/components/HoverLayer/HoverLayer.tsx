import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { Coordinate, HoverLineData, Layout, Variant } from '../../types';
import { useHoveredDatapoint } from '../../hooks/useHoveredDatapoint';
import { getPlotStyleData } from '../../utils/getPlotStyleData';

import { HoverLine } from './HoverLine';
import { HoverLineInfo } from './HoverLineInfo';
import { HoverMarker } from './HoverMarker';
import { HoverLayerWrapper } from './elements';

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  variant?: Variant;
  plotHoverEvent?: PlotHoverEvent;
  cursorPosition?: Coordinate;
  backgroundColor?: string;
  isContinuousHover: boolean;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  variant,
  plotHoverEvent,
  cursorPosition,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  isContinuousHover,
  formatHoverLineInfo,
}) => {
  const { showHoverLine, showHoverLineInfo, showHoverMarker, showMarkers } =
    layout;

  const datapoint = useHoveredDatapoint(plotHoverEvent);

  const plotStyleData = getPlotStyleData(chartRef.current);

  const hoverLinePosition = isContinuousHover
    ? cursorPosition
    : datapoint.position;

  const hoverMarkerPosition = {
    x: showMarkers ? datapoint.position.x : cursorPosition?.x,
    y: datapoint.position.y,
  };

  return (
    <HoverLayerWrapper
      className="hover-layer"
      style={{
        display: plotHoverEvent ? 'initial' : 'none',
      }}
    >
      <HoverLine
        isVisible={showHoverLine}
        position={hoverLinePosition}
        plotStyleData={plotStyleData}
      />

      <HoverLineInfo
        chartRef={chartRef}
        isVisible={showHoverLine && showHoverLineInfo}
        position={hoverLinePosition}
        plotStyleData={plotStyleData}
        plotHoverEvent={plotHoverEvent}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <HoverMarker
        isVisible={showHoverMarker}
        position={hoverMarkerPosition}
        variant={variant}
        markerColor={datapoint.color}
        borderColor={backgroundColor}
      />
    </HoverLayerWrapper>
  );
};
