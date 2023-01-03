// @ts-nocheck
/**
 * Data Profiling Boxplot
 */

import Plot from 'react-plotly.js';
import styled from 'styled-components/macro';
import { DataProfilingResultResults } from '@cognite/calculation-backend';
import EmptyState from './EmptyState';

type Props = {
  data?:
    | DataProfilingResultResults['density_boxplot']
    | DataProfilingResultResults['timedelta_boxplot'];
  noDataText?: string;
};

const BoxplotContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Boxplot = ({ data, noDataText }: Props) => {
  if (!data) {
    return <EmptyState text={noDataText} />;
  }

  return (
    <BoxplotContainer>
      <Plot
        data={[
          {
            type: 'box',
            orientation: 'h',
            lowerfence: [data.lower_whisker],
            q1: [data.q25],
            median: [data.q50],
            q3: [data.q75],
            upperfence: [data.upper_whisker],
            whiskerwidth: 0.5,
          },
        ]}
        layout={{
          width: 300,
          height: 100,
          margin: { l: 0, r: 0, t: 0, b: 0 },
          dragmode: false,
          xaxis: {
            range: [
              (data.lower_whisker as number) * 0.95,
              (data.upper_whisker as number) * 1.05,
            ],
          },
        }}
        config={{ displayModeBar: false }}
      />
    </BoxplotContainer>
  );
};

export default Boxplot;
