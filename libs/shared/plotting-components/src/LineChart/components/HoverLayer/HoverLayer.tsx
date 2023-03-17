import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { Coordinate, HoverLineData, Layout, Variant } from '../../types';

import { HoverLine } from './HoverLine';
import { HoverLineInfo } from './HoverLineInfo';
import { getPlotStyleData } from '../../utils/getPlotStyleData';
import { HoverMarker } from './HoverMarker';
import { DEFAULT_BACKGROUND_COLOR } from '../../constants';

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  variant?: Variant;
  plotHoverEvent?: PlotHoverEvent;
  position?: Coordinate;
  backgroundColor?: string;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  variant,
  plotHoverEvent,
  position,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  formatHoverLineInfo,
}) => {
  const { showHoverLine, showHoverLineInfo, showHoverMarker, showMarkers } =
    layout;

  const plotStyleData = getPlotStyleData(chartRef.current);

  return (
    <div
      className="hover-layer"
      style={{
        display: plotHoverEvent ? 'initial' : 'none',
      }}
    >
      <HoverLine
        isVisible={showHoverLine}
        position={position}
        plotStyleData={plotStyleData}
      />

      <HoverLineInfo
        chartRef={chartRef}
        isVisible={showHoverLine && showHoverLineInfo}
        position={position}
        plotStyleData={plotStyleData}
        plotHoverEvent={plotHoverEvent}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <HoverMarker
        isVisible={!showMarkers && showHoverMarker}
        position={position}
        variant={variant}
        plotHoverEvent={plotHoverEvent}
        borderColor={backgroundColor}
      />
    </div>
  );
};
