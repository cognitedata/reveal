import React, { useMemo, useRef, useState } from 'react';
import Plot, { Figure } from 'react-plotly.js';

import { Datum, LayoutAxis } from 'plotly.js';
import { maxMin, minMax } from 'utils/number';

import { Loader } from '@cognite/cogs.js';

import { useDebounce } from 'hooks/useDebounce';

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
  /** scales the graph to match with events by depth */
  adaptiveChart?: boolean;
};

const chartStyles = { display: 'flex !important' };

const DEFAULT_GRAPH_Y_VIEWPORT = [100, 0];
const DEFAULT_GRAPH_X_VIEWPORT = [0, 10];

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
      adaptiveChart,
    }: ChartProps,
    ref
  ) => {
    const [detailCardData, setDetailCardData] =
      useState<Plotly.PlotMouseEvent>();

    const [yRange, setYRange] = useState<[number, number]>(
      maxMin(data?.[0]?.y || DEFAULT_GRAPH_Y_VIEWPORT)
    );
    const [xRange, setXRange] = useState<[Datum, Datum]>(
      minMax(data?.[0]?.x || DEFAULT_GRAPH_X_VIEWPORT)
    );

    // Typing this anything besides 'any', causes a mismatch in LegacyRef for Plotly (investigate this the future).
    const chartRef = useRef<any>();
    const axisConfigs: AxisConfig = React.useMemo(
      () => ({
        xaxis: {
          autorange: adaptiveChart ? false : axisAutorange?.x,
          ticksuffix: axisTicksuffixes?.x,
          title: {
            text: axisNames?.x || 'x Axis',
          },
          range: adaptiveChart ? xRange : undefined,
          spikemode: 'across',
          spikethickness: 1,
          tickformat: 'digit',
        },
        yaxis: {
          autorange: adaptiveChart ? false : axisAutorange?.y,
          ticksuffix: axisTicksuffixes?.y,
          title: {
            text: axisNames?.y || 'Y Axis',
          },
          range: adaptiveChart ? yRange : undefined,
          spikemode: 'across',
          spikethickness: 1,
          tickformat: 'digit',
        },
      }),
      [
        axisTicksuffixes,
        axisAutorange,
        axisNames,
        yRange,
        adaptiveChart,
        xRange,
      ]
    );

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
        side: 'top',
        tickformat: 'digit',
        ticklen: 40,
      };
    }

    const layout: Partial<Plotly.Layout> = React.useMemo(
      () => ({
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
            // autorange: axisAutorange?.y,
          },
          zaxis: {
            title: axisNames?.z || 'z Axis',
            autorange: axisAutorange?.z,
          },
        },
        ...axisConfigs,
        hovermode,
        height,
        margin: {
          t: 45,
          r: 16,
          l: 60,
          b: 35,
        },
        dragmode: 'pan',
      }),
      [
        axisConfigs,
        hovermode,
        height,
        axisNames,
        axisAutorange,
        autosize,
        showLegend,
      ]
    );

    const handleRelayoutChange = useDebounce(
      (event: Plotly.PlotRelayoutEvent) => {
        const minY = event['yaxis.range[1]'] || 0;
        const maxY = event['yaxis.range[0]'] || 0;

        onMinMaxChange?.(minY, maxY);
      },
      1000
    );

    const handleUpdate = useDebounce((figure: Figure, graph: HTMLElement) => {
      const gap = calculateYTicksGap(graph);
      const visibleYValues = findVisibleYTicksValues(graph);

      // Change the graph position to match the events by depth column.
      if (adaptiveChart) {
        const [max, min] = maxMin(visibleYValues);

        setYRange((prevState) => {
          const [prevMax, prevMin] = prevState;
          if (prevMax !== max && prevMin !== min) {
            return [max, min];
          }

          return prevState;
        });

        if (figure.layout?.xaxis?.range) {
          setXRange(figure.layout.xaxis.range as [Datum, Datum]);
        }
      }

      onLayoutChange?.(gap, visibleYValues);
    }, 100);

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
              // 'zoomIn2d',
              // 'zoomOut2d',
            ],
            scrollZoom: true,
          }}
          onHover={(event: Plotly.PlotMouseEvent) => {
            setDetailCardData(event);
          }}
          onUnhover={() => {
            setDetailCardData(undefined);
          }}
        />
      ),
      [data, layout]
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
