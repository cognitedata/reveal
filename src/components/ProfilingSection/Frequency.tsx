import React from 'react';

import FrequencyStats, { Count } from 'containers/Profiling/FrequencyStats';
import { Section } from 'components/ProfilingSection';

type Props = {
  allCount: number;
  counts?: Count[];
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const Frequency = ({
  allCount,
  counts,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  return (
    <Section
      title={title ?? 'Frequency analysis'}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {counts ? (
        <FrequencyStats allCount={allCount} counts={counts} />
      ) : (
        'MISSING'
      )}
    </Section>
  );
};
