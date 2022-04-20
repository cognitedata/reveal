import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { withSize } from 'react-sizeme';

import { ModeBarButton } from 'plotly.js';

import { Loader } from '@cognite/cogs.js';

import { Collapse, Expand } from './icons';
import { ChartProps } from './types';

const chartStyles = {
  display: 'flex !important',
};

const getWidth = (isTrajectory: boolean, width: number | null) => {
  if (!width) return undefined;
  return isTrajectory && width ? width - 10 : width;
};

const Chart = (props: ChartProps) => {
  const {
    data,
    size,
    axisNames,
    axisAutorange,
    axisTicksuffixes,
    title,
    autosize = false,
    showLegend = false,
    isTrajectory = false,
    hovermode = 'closest',
    margin,
    onExpand,
    onCollapse,
  } = props;

  const layout: Partial<Plotly.Layout> = {
    legend: { orientation: 'v' },
    title,
    showlegend: showLegend,
    autosize,
    height: size.height || undefined,
    width: getWidth(isTrajectory, size.width),
    scene: {
      xaxis: { title: axisNames?.x || 'x Axis', autorange: axisAutorange?.x },
      yaxis: { title: axisNames?.y || 'y Axis', autorange: axisAutorange?.y },
      zaxis: { title: axisNames?.z || 'z Axis', autorange: axisAutorange?.z },
    },
    xaxis: {
      autorange: axisAutorange?.x,
      ticksuffix: axisTicksuffixes?.x,
      title: {
        text: axisNames?.x || 'x Axis',
      },
    },
    yaxis: {
      autorange: axisAutorange?.y,
      ticksuffix: axisTicksuffixes?.y,
      title: {
        text: axisNames?.y || 'Y Axis',
      },
    },
    hovermode,
    margin,
  };

  const expandOrCollapseButton: ModeBarButton[] = useMemo(() => {
    if (onExpand) {
      return [
        {
          name: 'Expand',
          title: 'Expand full-sized view',
          icon: Expand,
          click: onExpand,
        },
      ];
    }
    if (onCollapse) {
      return [
        {
          name: 'Collapse',
          title: 'Collapse full-sized view',
          icon: Collapse,
          click: onCollapse,
        },
      ];
    }
    return [];
  }, [onExpand, onCollapse]);

  return (
    <React.Suspense fallback={<Loader darkMode={false} />}>
      <Plot
        data-testid="plotly-chart"
        data={data}
        layout={layout}
        style={chartStyles}
        config={{
          responsive: true,
          displaylogo: false,
          modeBarButtonsToAdd: [...expandOrCollapseButton],
        }}
      />
    </React.Suspense>
  );
};

export default withSize()(Chart);
