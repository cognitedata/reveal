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

export interface HoverLayerProps {
  chartRef: React.RefObject<HTMLDivElement>;
  layout: Layout;
  plotHoverEvent?: PlotHoverEvent;
  backgroundColor?: string;
  onHover?: () => void;
  onUnhover?: () => void;
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export const HoverLayer: React.FC<HoverLayerProps> = ({
  chartRef,
  layout,
  plotHoverEvent,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  onHover,
  onUnhover,
  formatHoverLineInfo,
}) => {
  const { showHoverLine, showHoverLineInfo, showHoverMarker } = layout;

  const markerPosition = getMarkerPosition(plotHoverEvent);
  const plotStyleData = getPlotStyleData(chartRef.current);

  const getHoverLayerComponentVisibility = (showConfig: boolean) => {
    if (!plotHoverEvent) {
      return false;
    }
    return showConfig;
  };

  return (
    <HoverLayerWrapper
      style={{ visibility: plotHoverEvent ? 'visible' : 'hidden' }}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      <HoverLine
        isVisible={getHoverLayerComponentVisibility(showHoverLine)}
        markerPosition={markerPosition}
        plotStyleData={plotStyleData}
      />

      <HoverLineInfo
        chartRef={chartRef}
        isVisible={getHoverLayerComponentVisibility(showHoverLineInfo)}
        markerPosition={markerPosition}
        plotStyleData={plotStyleData}
        plotHoverEvent={plotHoverEvent}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <HoverMarker
        isVisible={getHoverLayerComponentVisibility(showHoverMarker)}
        markerPosition={markerPosition}
        plotHoverEvent={plotHoverEvent}
        backgroundColor={backgroundColor}
      />
    </HoverLayerWrapper>
  );
};
