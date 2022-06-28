import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { Skeleton } from 'antd';
import { Flex } from '@cognite/cogs.js';

const Plot = createPlotlyComponent(Plotly);

type HistogramProps = {
  loading: boolean;
  data: { rangeStart: number; rangeEnd: number; quantity: number }[];
  unit: string | undefined;
  noDataText?: string;
};

export const Histogram = ({
  loading,
  data,
  unit,
  noDataText = 'No data available',
}: HistogramProps) => {
  const size = { width: 392, height: 260 };
  if (loading) return <Skeleton.Image style={size} />;

  if (!data || !data.length) {
    return (
      <Flex style={{ ...size }} alignItems="center" justifyContent="center">
        {noDataText}
      </Flex>
    );
  }

  return (
    <Plot
      data={[
        {
          type: 'bar',
          x: data.map(({ rangeStart }) => rangeStart),
          y: data.map(({ quantity }) => quantity),
          hovertext: data.map(
            ({ quantity, rangeStart, rangeEnd }) =>
              `${quantity} between ${rangeStart} and ${rangeEnd}`
          ),
          hoverinfo: 'text',
          hoverlabel: {
            bgcolor: '#ffffff',
            font: {
              color: '#333333',
            },
          },
        },
      ]}
      layout={{
        ...size,
        bargap: 0,
        margin: { l: 40, r: 5, t: 0, b: 70 },
        xaxis: {
          tickvals: data.map(({ rangeStart }) => rangeStart),
          ticks: 'outside',
          tickangle: 45,
          title: { text: unit, standoff: 60 },
        },
        yaxis: {
          ticks: 'outside',
        },
        dragmode: false,
      }}
      config={{ displayModeBar: false }}
    />
  );
};
