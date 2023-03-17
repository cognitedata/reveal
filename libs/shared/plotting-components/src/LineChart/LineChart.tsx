import * as React from 'react';
import { useRef, useState } from 'react';

import { LineChartWrapper } from './elements';
import { LineChartProps } from './types';
import { Header } from './components/Header';
import { Tooltip } from './components/Tooltip';
import { HoverLayer } from './components/HoverLayer';
import { Legend } from './components/Legend';
import { Plot, PlotElement } from './components/Plot';
import { Toolbar } from './components/Toolbar';

import { getLayout } from './utils/getLayout';
import { usePlotHoverEvent } from './hooks/usePlotHoverEvent';
import { getConfig } from './utils/getConfig';
import { getStyleProperties } from './utils/getStyleProperties';
import { useCursorPosition } from './hooks/useCursorPosition';
import { getMarkerPosition } from './utils/getMarkerPosition';
import { isContinuousHoverEnabled } from './utils/isContinuousHoverEnabled';

export const LineChart: React.FC<LineChartProps> = ({
  data,
  isLoading,
  xAxis,
  yAxis,
  title,
  subtitle,
  variant,
  layout: layoutProp = {},
  config: configProp = {},
  style: styleProp = {},
  formatTooltipContent,
  renderTooltipContent,
  renderFilters,
  renderActions,
  formatHoverLineInfo,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<PlotElement>(null);

  const [isPlotSelecting, setPlotSelecting] = useState(false);

  const layout = getLayout(layoutProp, variant);
  const config = getConfig(configProp, variant);
  const style = getStyleProperties(styleProp, variant);

  const {
    legendPlacement,
    showTitle,
    showSubtitle,
    showLegend,
    showTooltip,
    showFilters,
    showActions,
  } = layout;
  const { buttonZoom, hoverMode } = config;
  const { backgroundColor } = style;

  const isContinuousHover = isContinuousHoverEnabled(hoverMode);

  const { cursorPosition, isCursorOnPlot } = useCursorPosition(chartRef);

  const { plotHoverEvent, updatePlotHoverEvent, setPlotUnhovered } =
    usePlotHoverEvent({
      chartRef,
      isCursorOnPlot,
      isContinuousHover,
      isPlotSelecting,
    });

  const markerPosition = getMarkerPosition(plotHoverEvent);

  return (
    <LineChartWrapper ref={chartRef} style={style}>
      <Toolbar
        plotRef={plotRef}
        zoomDirectionConfig={buttonZoom}
        showFilters={showFilters}
        showActions={showActions}
        renderFilters={renderFilters}
        renderActions={renderActions}
      />

      <Header
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
      />

      <Plot
        ref={plotRef}
        data={data}
        isLoading={isLoading}
        variant={variant}
        xAxis={xAxis}
        yAxis={yAxis}
        layout={layout}
        config={config}
        plotHoverEvent={plotHoverEvent}
        isCursorOnPlot={isCursorOnPlot}
        height={styleProp?.height}
        width={styleProp?.width}
        backgroundColor={backgroundColor}
        onHover={updatePlotHoverEvent}
        onUnhover={setPlotUnhovered}
        onSelecting={() => setPlotSelecting(true)}
        onSelected={() => setPlotSelecting(false)}
      />

      <HoverLayer
        chartRef={chartRef}
        layout={layout}
        variant={variant}
        plotHoverEvent={plotHoverEvent}
        position={isContinuousHover ? cursorPosition : markerPosition}
        backgroundColor={backgroundColor}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <Tooltip
        chartRef={chartRef}
        variant={variant}
        xAxisName={xAxis?.name}
        yAxisName={yAxis?.name}
        backgroundColor={backgroundColor}
        plotHoverEvent={plotHoverEvent}
        referencePosition={isContinuousHover ? { x: cursorPosition?.x } : {}}
        showTooltip={showTooltip}
        formatTooltipContent={formatTooltipContent}
        renderTooltipContent={renderTooltipContent}
      />

      <Legend
        data={data}
        showLegend={showLegend}
        legendPlacement={legendPlacement}
      />
    </LineChartWrapper>
  );
};
