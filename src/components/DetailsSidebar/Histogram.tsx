/* eslint camelcase: 0 */
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { StatisticsResultResults } from '@cognite/calculation-backend';
import { formatNumber, getDisplayUnit } from '.';

const Plot = createPlotlyComponent(Plotly);

type HistogramProps = {
  data: StatisticsResultResults['histogram'];
  unit: string;
};

export const Histogram = ({ data, unit }: HistogramProps) => {
  return data && data.length <= 0 ? (
    <span>No data</span>
  ) : (
    <Plot
      data={[
        {
          type: 'bar',
          x: data?.map(({ range_start }) => formatNumber(range_start || NaN)),
          y: data?.map(({ quantity }) => quantity || NaN),
          hovertext: data?.map(
            ({ quantity, range_start, range_end }) =>
              `${quantity} between ${formatNumber(
                range_start || NaN
              )} and ${formatNumber(range_end || NaN)}`
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
        width: 300,
        height: 260,
        bargap: 0,
        margin: { l: 30, r: 5, t: 0, b: 70 },
        xaxis: {
          tickvals: data?.map(({ range_start }) =>
            formatNumber(range_start || NaN)
          ),
          ticks: 'outside',
          tickangle: 45,
          title: {
            text: getDisplayUnit(unit),
            standoff: 60,
          },
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
