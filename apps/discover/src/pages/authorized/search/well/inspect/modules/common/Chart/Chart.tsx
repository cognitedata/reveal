import React from 'react';
import Plot from 'react-plotly.js';
import { withSize, SizeMeProps } from 'react-sizeme';

import { Loader } from '@cognite/cogs.js';

type Data = any;

type Autorange = true | false | 'reversed';

export type ChartProps = {
  data: Data[];
  size: SizeMeProps['size'];
  axisNames?: { x?: string; y?: string; z?: string };
  axisAutorange?: { x?: Autorange; y?: Autorange; z?: Autorange };
  axisTicksuffixes?: { x?: string; y?: string; z?: string };
  title?: string;
  autosize?: boolean;
  showLegend?: boolean;
  hovermode?: 'closest' | 'x' | 'y' | 'x unified' | 'y unified' | false;
  isTrajectory?: boolean;
  margin?: Partial<Plotly.Margin>;
};

const chartStyles = {
  display: 'flex !important',
};

const getWidth = (isTrajectory: boolean, width: number | null) => {
  if (!width) return undefined;
  return isTrajectory && width ? width - 10 : width;
};

const Chart = ({
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
}: ChartProps) => {
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
        }}
      />
    </React.Suspense>
  );
};

export default withSize()(Chart);
