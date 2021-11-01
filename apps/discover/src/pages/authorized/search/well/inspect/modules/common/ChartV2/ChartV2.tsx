import React, { useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';

import { LayoutAxis } from 'plotly.js';

import { Loader } from '@cognite/cogs.js';

import DetailCard from './DetailCard';
import { ChartWrapper } from './elements';
import Toolbar from './Toolbar';

type Data = any;

type Autorange = true | false | 'reversed';

type AxisConfig = {
  xaxis: Partial<LayoutAxis>;
  yaxis: Partial<LayoutAxis>;
  xaxis2?: Partial<LayoutAxis>;
};

export type ChartProps = {
  data: Data[];
  axisNames?: { x?: string; y?: string; z?: string; x2?: string };
  axisAutorange?: {
    x?: Autorange;
    y?: Autorange;
    z?: Autorange;
    x2?: Autorange;
  };
  axisTicksuffixes?: { x?: string; y?: string; z?: string; x2?: string };
  title: string;
  autosize?: boolean;
  showLegend?: boolean;
  hovermode?: 'closest' | 'x' | 'y' | 'x unified' | 'y unified' | false;
  isTrajectory?: boolean;
  margin?: Partial<Plotly.Margin>;
};

const chartStyles = { display: 'flex !important' };

const ChartV2 = ({
  data,
  axisNames,
  axisAutorange,
  axisTicksuffixes,
  title,
  autosize = false,
  showLegend = false,
  hovermode = 'y unified',
}: ChartProps) => {
  const [detailCardData, setDetailCardData] = useState<Plotly.PlotMouseEvent>();

  const chartRef = useRef<any>();
  const axisConfigs: AxisConfig = {
    xaxis: {
      autorange: axisAutorange?.x,
      ticksuffix: axisTicksuffixes?.x,
      title: {
        text: axisNames?.x || 'x Axis',
      },
      spikemode: 'across',
      spikethickness: 1,
      tickformat: 'digit',
    },
    yaxis: {
      autorange: axisAutorange?.y,
      ticksuffix: axisTicksuffixes?.y,
      title: {
        text: axisNames?.y || 'Y Axis',
      },
      spikemode: 'across',
      spikethickness: 1,
      tickformat: 'digit',
    },
  };

  if (axisNames?.x2) {
    axisConfigs.xaxis2 = {
      autorange: axisAutorange?.x2,
      ticksuffix: axisTicksuffixes?.x2,
      title: {
        text: axisNames?.x2 || 'x Axis 2',
      },
      showgrid: false,
      spikemode: 'across',
      spikethickness: 1,
      overlaying: 'x',
      side: 'bottom',
      tickformat: 'digit',
    };
  }

  const layout: Partial<Plotly.Layout> = {
    legend: { orientation: 'v' },
    title: {
      text: title,
    },
    showlegend: showLegend,
    autosize,
    scene: {
      xaxis: { title: axisNames?.x || 'x Axis', autorange: axisAutorange?.x },
      yaxis: { title: axisNames?.y || 'y Axis', autorange: axisAutorange?.y },
      zaxis: { title: axisNames?.z || 'z Axis', autorange: axisAutorange?.z },
    },
    ...axisConfigs,
    hovermode,
    margin: {
      t: 60,
      r: 16,
      l: 60,
      b: axisNames?.x2 && axisNames?.x ? 90 : 50,
    },
    dragmode: 'pan',
  };

  const plot = useMemo(
    () => (
      <Plot
        ref={chartRef}
        data-testid="plotly-chart"
        data={data}
        layout={layout}
        style={chartStyles}
        config={{
          responsive: true,
          displaylogo: false,
          displayModeBar: true,
          modeBarButtonsToRemove: [
            'toImage',
            'pan2d',
            'zoom2d',
            'resetViews',
            'toggleSpikelines',
            'hoverCompareCartesian',
            'hoverClosestCartesian',
            'resetScale2d',
            'zoomIn2d',
            'zoomOut2d',
          ],
          // scrollZoom: true,
        }}
        onHover={(event: Plotly.PlotMouseEvent) => {
          setDetailCardData(event);
        }}
        onUnhover={() => {
          setDetailCardData(undefined);
        }}
      />
    ),
    [data]
  );

  return (
    <React.Suspense fallback={<Loader darkMode={false} />}>
      <ChartWrapper>
        <Toolbar chartRef={chartRef} />
        <DetailCard data={detailCardData} />
        {plot}
      </ChartWrapper>
    </React.Suspense>
  );
};
export default ChartV2;
