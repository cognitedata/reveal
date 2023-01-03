/* eslint camelcase: 0 */

/**
 * Data Profiling Histogram
 */

import styled from 'styled-components/macro';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';
import { DataProfilingResultResults } from '@cognite/calculation-backend';
import { formatValueForDisplay } from 'utils/numbers';

const Plot = createPlotlyComponent(Plotly);

type Props = {
  data?:
    | DataProfilingResultResults['density_histogram']
    | DataProfilingResultResults['timedelta_histogram'];
  noDataText?: string;
  unitLabel?: string;
};

const EmptyState = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--cogs-greyscale-grey1);
`;

const HistogramContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Histogram = ({ data, noDataText, unitLabel }: Props) => {
  if (!data || !data.length) {
    return (
      <EmptyState>
        <span>
          <b>{noDataText}</b>
        </span>
      </EmptyState>
    );
  }

  return (
    <HistogramContainer>
      <Plot
        data={[
          {
            type: 'bar',
            x: data.map(({ range_start = NaN }) => range_start),
            y: data.map(({ quantity = NaN }) => quantity),
            hovertext: data.map(
              ({ quantity = NaN, range_start = NaN, range_end = NaN }) =>
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
            tickvals: data
              .map(({ range_start = NaN }) => range_start)
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
