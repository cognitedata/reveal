import * as React from 'react';
import { useRef } from 'react';

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
import { useCursorHandler } from './hooks/useCursorHandler';

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxis,
  yAxis,
  title,
  subtitle,
  variant,
  layout: layoutProp = {},
  config: configProp = {},
  style: styleProp = {},
  disableTooltip,
  renderTooltipContent,
  renderFilters,
  renderActions,
  formatHoverLineInfo,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<PlotElement>(null);

  const {
    hoverStatus,
    isCursorOnPlotArea,
    initializePlotLayerHandler,
    hoverLayer,
    unhoverLayer,
  } = useCursorHandler();

  const { plotHoverEvent, plotHoverEventHandler } =
    usePlotHoverEvent(hoverStatus);

  const layout = getLayout(layoutProp, variant);
  const config = getConfig(configProp);
  const style = getStyleProperties(styleProp, variant);

  const { legendPlacement, showTitle, showSubtitle, showLegend } = layout;
  const { backgroundColor, padding } = style;

  return (
    <LineChartWrapper ref={chartRef} style={{ backgroundColor, padding }}>
      <Toolbar
        plotRef={plotRef}
        zoomDirectionConfig={config.buttonZoom}
        showFilters={layout.showFilters}
        showActions={layout.showActions}
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
        xAxis={xAxis}
        yAxis={yAxis}
        layout={layout}
        config={config}
        isCursorOnPlotArea={isCursorOnPlotArea}
        onInitialized={(_, graph) => initializePlotLayerHandler(graph)}
        onHover={plotHoverEventHandler.onHoverPlot}
        onUnhover={plotHoverEventHandler.onUnhoverPlot}
      />

      <HoverLayer
        chartRef={chartRef}
        layout={layout}
        plotHoverEvent={plotHoverEvent}
        backgroundColor={backgroundColor}
        isCursorOnPlotArea={isCursorOnPlotArea}
        onHover={() => hoverLayer('hoverLayer')}
        onUnhover={() => unhoverLayer('hoverLayer')}
        formatHoverLineInfo={formatHoverLineInfo}
      />

      <Tooltip
        chartRef={chartRef}
        plotHoverEvent={plotHoverEvent}
        xAxisName={xAxis?.name}
        yAxisName={yAxis?.name}
        backgroundColor={backgroundColor}
        disableTooltip={disableTooltip}
        renderTooltipContent={renderTooltipContent}
        onHover={() => hoverLayer('tooltip')}
        onUnhover={() => unhoverLayer('tooltip')}
      />

      <Legend
        data={data}
        showLegend={showLegend}
        legendPlacement={legendPlacement}
      />
    </LineChartWrapper>
  );
};
