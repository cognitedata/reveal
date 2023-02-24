import * as React from 'react';

import { Layout, PlotHoverEvent, PlotMouseEvent } from 'plotly.js';
import Plot from 'react-plotly.js';
import { LineChartWrapper, PlotWrapper } from './elements';
import { LineChartProps } from './types';
import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import isEmpty from 'lodash/isEmpty';
import { Tooltip } from './components/Tooltip';
import { getChartData } from './utils/getChartData';
import { HoverMarker } from './components/HoverMarker';
import { getMarkerPosition } from './utils/getMarkerPosition';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_MARGIN,
  HOVER_MARKER_SIZE,
} from './constants';
import { Legend } from './components/Legend';
import { getRangeMode } from './utils/getRangeMode';
import { getCommonAxisLayoutProps } from './utils/getCommonAxisLayoutProps';
import { getMarginValue } from './utils/getMarginValue';
import { getLayout } from './utils/getLayout';

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxis,
  yAxis,
  title,
  subtitle,
  variant,
  layout,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  responsive = true,
  disableTooltip,
  renderTooltipContent,
}) => {
  const [plotHoverEvent, setPlotHoverEvent] = useState<PlotHoverEvent>();

  const chartData = useMemo(() => getChartData(data), [data]);

  const xAxisRangeMode = useMemo(() => getRangeMode(data, 'x'), [data]);
  const yAxisRangeMode = useMemo(() => getRangeMode(data, 'y'), [data]);

  const {
    showTitle,
    showSubtitle,
    showLegend,
    showAxisNames,
    showTicks,
    showTickLabels,
  } = getLayout(variant, layout);

  const showXAxisName = showAxisNames && !isEmpty(xAxis?.name);
  const showYAxisName = showAxisNames && !isEmpty(yAxis?.name);

  const plotlyLayout: Partial<Layout> = useMemo(() => {
    return {
      xaxis: {
        ...getCommonAxisLayoutProps(xAxis, showXAxisName),
        rangemode: xAxisRangeMode,
        showticklabels: showTickLabels,
      },
      yaxis: {
        ...getCommonAxisLayoutProps(yAxis, showYAxisName),
        rangemode: yAxisRangeMode,
        showticklabels: showTickLabels,
      },
      dragmode: false,
      margin: {
        t: DEFAULT_MARGIN,
        r: DEFAULT_MARGIN,
        l: getMarginValue(showYAxisName, showTickLabels),
        b: getMarginValue(showXAxisName, showTickLabels),
      },
    };
  }, [
    xAxis,
    yAxis,
    xAxisRangeMode,
    yAxisRangeMode,
    showXAxisName,
    showYAxisName,
    showTickLabels,
  ]);

  const handleUnhover = (plotMouseEvent: PlotMouseEvent) => {
    const { x = 0, y = 0 } = getMarkerPosition(plotMouseEvent);
    const { clientX, clientY } = plotMouseEvent.event;

    if (
      Math.abs(x - clientX) > HOVER_MARKER_SIZE ||
      Math.abs(y - clientY) > HOVER_MARKER_SIZE
    ) {
      setPlotHoverEvent(undefined);
    }
  };

  return (
    <LineChartWrapper style={{ backgroundColor }}>
      <Header
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
      />

      <PlotWrapper showticks={showTicks}>
        <Plot
          data={chartData}
          layout={plotlyLayout}
          onHover={setPlotHoverEvent}
          onUnhover={handleUnhover}
          useResizeHandler={responsive}
        />
      </PlotWrapper>

      <HoverMarker
        plotHoverEvent={plotHoverEvent}
        backgroundColor={backgroundColor}
      />

      <Tooltip
        plotHoverEvent={plotHoverEvent}
        xAxisName={xAxis?.name}
        yAxisName={yAxis?.name}
        backgroundColor={backgroundColor}
        disableTooltip={disableTooltip}
        renderTooltipContent={renderTooltipContent}
      />

      <Legend data={chartData} showLegend={showLegend} />
    </LineChartWrapper>
  );
};
