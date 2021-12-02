import React from 'react';
import { zip } from 'lodash';

import FrequencyStats from 'containers/Profiling/FrequencyStats';
import { Section } from 'components/ProfilingSection';

type Props = {
  allCount: number;
  counts?: [string[], number[]];
  title?: string;
};
export const Frequency = ({ allCount, counts, title }: Props): JSX.Element => {
  const fixedCounts = counts
    ? zip(...counts)
        .map(([value, count]) => ({
          value: value as string,
          count: count as number,
        }))
        .sort((a, b) => {
          if (a.value === '<other>') {
            return 1;
          } else if (b.value === '<other>') {
            return -1;
          } else {
            return b.count - a.count;
          }
        })
    : [];

  return (
    <Section title={title ?? 'Frequency analysis'}>
      {fixedCounts ? (
        <FrequencyStats allCount={allCount} counts={fixedCounts} />
      ) : (
        'MISSING'
      )}
    </Section>
  );
};
