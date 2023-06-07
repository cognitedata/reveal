/* eslint camelcase: 0 */
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { StatisticsResultResults } from '@cognite/calculation-backend';
import { getUnitConverter } from 'utils/units';
import { formatValueForDisplay } from 'utils/numbers';

const Plot = createPlotlyComponent(Plotly);

type HistogramProps = {
  data?: StatisticsResultResults['histogram'];
  unit?: string;
  preferredUnit?: string;
  unitLabel?: string;
  noDataText?: string;
};

export const Histogram = ({
  data,
  unit,
  preferredUnit,
  unitLabel,
  noDataText = 'No histogram data available',
}: HistogramProps) => {
  if (!data || !data.length) {
    return <span>{noDataText}</span>;
  }

  const convertUnit = getUnitConverter(unit, preferredUnit);

  return (
    <Plot
      data={[
        {
          type: 'bar',
          x: data.map(({ range_start = NaN }) => range_start).map(convertUnit),
          y: data.map(({ quantity = NaN }) => quantity),
          hovertext: data.map(
            ({ quantity = NaN, range_start = NaN, range_end = NaN }) =>
              `${quantity} between ${formatValueForDisplay(
                convertUnit(range_start)
              )} and ${formatValueForDisplay(convertUnit(range_end))}`
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
        margin: { l: 40, r: 5, t: 0, b: 70 },
        xaxis: {
          tickvals: data
            .map(({ range_start = NaN }) => range_start)
            .map(convertUnit)
            .map((x) => formatValueForDisplay(x)),
          ticks: 'outside',
          tickangle: 45,
          title: {
            text: unitLabel,
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
