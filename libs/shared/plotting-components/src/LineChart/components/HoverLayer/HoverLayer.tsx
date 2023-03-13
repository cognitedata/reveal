import * as React from 'react';

import { PlotHoverEvent } from 'plotly.js';

import { HoverLayerWrapper } from './elements';
import { Coordinate, HoverLineData, Layout } from '../../types';

import { HoverLine } from './HoverLine';
import { HoverLineInfo } from './HoverLineInfo';
import { getPlotStyleData } from '../../utils/getPlotStyleData';

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  position?: Coordinate;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  plotHoverEvent,
  position,
  formatHoverLineInfo,
}) => {
  const { showHoverLine, showHoverLineInfo } = layout;

  const plotStyleData = getPlotStyleData(chartRef.current);

  return (
    <HoverLayerWrapper
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
        isVisible={
          showHoverLine && showHoverLineInfo && Boolean(plotHoverEvent)
        }
        position={position}
        plotStyleData={plotStyleData}
        plotHoverEvent={plotHoverEvent}
        formatHoverLineInfo={formatHoverLineInfo}
      />
    </HoverLayerWrapper>
  );
};
