// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// Need a lot of fixes for data props & layout props for fixing ts-nocheck

/**
 * Data Profiling Boxplot
 */

import React from 'react';
import Plot from 'react-plotly.js';

import styled from 'styled-components/macro';

import { DataProfilingResultResults } from '@cognite/calculation-backend';
import { Tooltip } from '@cognite/cogs.js';

import { makeDefaultTranslations } from '../../utils/translations';

import EmptyState from './EmptyState';

type Props = {
  data?:
    | DataProfilingResultResults['density_boxplot']
    | DataProfilingResultResults['timedelta_boxplot'];
  boxplotType: 'timedelta' | 'density';
  noDataText?: string;
};

const BoxplotContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const defaultTranslations = makeDefaultTranslations(
  'Lower whisker',
  '25th percentile',
  'Median',
  '75th percentile',
  'Upper whisker'
);

const Boxplot = ({ data, noDataText, boxplotType }: Props) => {
  if (!data) {
    return <EmptyState text={noDataText} />;
  }

  const t = {
    ...defaultTranslations,
  };

  const parseValue = (value: number | null): string | number => {
    if (!value) return '-';
    return boxplotType === 'timedelta' ? `${value / 1000}s` : value;
  };

  return (
    <BoxplotContainer>
      <Tooltip
        content={[
          {
            label: t['Lower whisker'],
            value: data.lower_whisker,
          },
          {
            label: t['25th percentile'],
            value: data.q25,
          },
          {
            label: t.Median,
            value: data.q50,
          },
          {
            label: t['75th percentile'],
            value: data.q75,
          },
          {
            label: t['Upper whisker'],
            value: data.upper_whisker,
          },
        ].map((item) => (
          <React.Fragment key={item.label}>
            <span>
              {item.label}: {parseValue(item.value)}
            </span>
            <br />
          </React.Fragment>
        ))}
      >
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
            height: 50,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            padding: { l: 0, r: 0, t: 0, b: 0 },
            dragmode: false,
            hovermode: false,
            xaxis: {
              range: [
                (data.lower_whisker as number) * 0.95,
                (data.upper_whisker as number) * 1.05,
              ],
            },
          }}
          config={{ displayModeBar: false }}
        />
      </Tooltip>
    </BoxplotContainer>
  );
};

export default Boxplot;
