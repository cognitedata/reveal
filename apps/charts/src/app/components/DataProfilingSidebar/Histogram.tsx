/* eslint camelcase: 0 */

/**
 * Data Profiling Histogram
 */

import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import styled from 'styled-components/macro';

import { DataProfilingResultResults } from '@cognite/calculation-backend';
import { formatValueForDisplay } from '@cognite/charts-lib';

import EmptyState from './EmptyState';

const Plot = createPlotlyComponent(Plotly);

type Props = {
  data?:
    | DataProfilingResultResults['density_histogram']
    | DataProfilingResultResults['timedelta_histogram'];
  noDataText?: string;
  unitLabel?: string;
  histogramType: 'timedelta' | 'density';
};

const HistogramContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Histogram = ({ data, noDataText, unitLabel, histogramType }: Props) => {
  if (!data || !data.length) {
    return <EmptyState text={noDataText} />;
  }

  const histogramData = data.map(
    ({ quantity = NaN, range_start = NaN, range_end = NaN }) => ({
      quantity,
      ...(histogramType === 'timedelta'
        ? { range_start: range_start / 1000, range_end: range_end / 1000 }
        : { range_start, range_end }),
    })
  );

  return (
    <HistogramContainer>
      <Plot
        data={[
          {
            type: 'bar',
            x: histogramData.map(({ range_start }) => range_start),
            y: histogramData.map(({ quantity }) => quantity),
            hovertext: histogramData.map(
              ({ quantity, range_start, range_end }) =>
                `${quantity} between ${formatValueForDisplay(
                  range_start
                )} and ${formatValueForDisplay(range_end)}`
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
          bargap: 2,
          margin: { l: 40, r: 0, t: 0, b: 70 },
          xaxis: {
            tickvals: histogramData
              .map(({ range_start }) => range_start)
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
    </HistogramContainer>
  );
};

export default Histogram;
