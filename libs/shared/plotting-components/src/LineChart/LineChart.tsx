import * as React from 'react';

import { LineChartWrapper } from './elements';
import { LineChartProps } from './types';
import { Header } from './components/Header';
import { Tooltip } from './components/Tooltip';
import { HoverMarker } from './components/HoverMarker';
import { Legend } from './components/Legend';
import { getLayout } from './utils/getLayout';
import { usePlotHoverEvent } from './hooks/usePlotHoverEvent';
import { Plot } from './components/Plot';

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxis,
  yAxis,
  title,
  subtitle,
  variant,
  layout: layoutProp,
  disableTooltip,
  renderTooltipContent,
}) => {
  const { plotHoverEvent, plotHoverEventHandler } = usePlotHoverEvent();

  const layout = getLayout(variant, layoutProp);

  const {
    backgroundColor,
    legendPlacement,
    showTitle,
    showSubtitle,
    showLegend,
  } = layout;

  return (
    <LineChartWrapper style={{ backgroundColor }}>
      <Header
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
      />

      <Plot
        data={data}
        xAxis={xAxis}
        yAxis={yAxis}
        layout={layout}
        onHover={plotHoverEventHandler.onHoverPlot}
        onUnhover={plotHoverEventHandler.onUnhoverPlot}
      />

      <HoverMarker
        plotHoverEvent={plotHoverEvent}
        backgroundColor={backgroundColor}
        onHover={plotHoverEventHandler.onHoverMarker}
        onUnhover={plotHoverEventHandler.onUnhoverMarker}
      />

      <Tooltip
        plotHoverEvent={plotHoverEvent}
        xAxisName={xAxis?.name}
        yAxisName={yAxis?.name}
        backgroundColor={backgroundColor}
        disableTooltip={disableTooltip}
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
