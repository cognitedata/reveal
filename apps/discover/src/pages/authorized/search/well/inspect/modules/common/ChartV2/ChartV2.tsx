import React, { useMemo, useRef, useState } from 'react';
import Plot, { Figure } from 'react-plotly.js';

import { LayoutAxis } from 'plotly.js';

import { Loader } from '@cognite/cogs.js';

import {
  BodyColumnHeaderLegend,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
} from '../Events/elements';

import DetailCard from './DetailCard';
import { ChartWrapper, Container } from './elements';
import Toolbar from './Toolbar';
import { calculateYTicksGap, findVisibleYTicksValues } from './utils';

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
  height?: number;
  onMinMaxChange?: (minY: number, maxY: number) => void;
  onLayoutChange?: (height: number, lines: number[]) => void;
};

const chartStyles = { display: 'flex !important' };

const ChartV2 = React.forwardRef(
  (
    {
      data,
      axisNames,
      axisAutorange,
      axisTicksuffixes,
      title,
      autosize = false,
      showLegend = false,
      hovermode = 'closest',
      height,
      onMinMaxChange,
      onLayoutChange,
    }: ChartProps,
    ref
  ) => {
    const [detailCardData, setDetailCardData] =
      useState<Plotly.PlotMouseEvent>();

    // Typing this anything besides 'any', causes a mismatch in LegacyRef for Plotly (investigate this the future).
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
      // title: {
      //   text: title,
      // },
      showlegend: showLegend,
      autosize,
      scene: {
        xaxis: {
          title: axisNames?.x || 'x Axis',
          autorange: axisAutorange?.x,
        },
        yaxis: {
          title: axisNames?.y || 'y Axis',
          autorange: axisAutorange?.y,
        },
        zaxis: { title: axisNames?.z || 'z Axis', autorange: axisAutorange?.z },
      },
      ...axisConfigs,
      hovermode,
      height,
      margin: {
        t: 60,
        r: 16,
        l: 60,
        b: axisNames?.x2 && axisNames?.x ? 90 : 50,
      },
      dragmode: 'pan',
    };

    const handleRelayoutChange = (event: Plotly.PlotRelayoutEvent) => {
      const minY = event['yaxis.range[1]'] || 0;
      const maxY = event['yaxis.range[0]'] || 0;
      onMinMaxChange?.(minY, maxY);
    };

    const handleUpdate = (_figure: Figure, graph: HTMLElement) => {
      const gap = calculateYTicksGap(graph);
      const visibleYValues = findVisibleYTicksValues(graph);

      onLayoutChange?.(gap, visibleYValues);
    };

    const handleInitialization = (figure: Figure, graph: HTMLElement) => {
      const [maxY, minY] = (figure.layout.yaxis?.range || [0, 0]) as [
        number,
        number
      ];
      onMinMaxChange?.(minY, maxY);
      handleUpdate(figure, graph);
    };

    const renderPlot = useMemo(
      () => (
        <Plot
          ref={chartRef}
          data-testid="plotly-chart"
          data={data}
          layout={layout}
          style={chartStyles}
          onInitialized={handleInitialization}
          onRelayout={handleRelayoutChange}
          onUpdate={handleUpdate}
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
        <Container>
          <BodyColumnHeaderWrapper>
            <BodyColumnMainHeader>{title}</BodyColumnMainHeader>
            <BodyColumnHeaderLegend>
              <Toolbar chartRef={chartRef} />
            </BodyColumnHeaderLegend>
          </BodyColumnHeaderWrapper>
          <ChartWrapper ref={ref}>
            <DetailCard data={detailCardData} />
            {renderPlot}
          </ChartWrapper>
        </Container>
      </React.Suspense>
    );
  }
);

export default ChartV2;
