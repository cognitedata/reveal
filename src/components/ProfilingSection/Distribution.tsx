import React from 'react';

import { Count } from 'hooks/profiling-service';

import { Graph } from 'containers/Profiling/Distribution';
import { Section } from 'components/ProfilingSection';

type Props = {
  histogram?: Count[];
  max?: number;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const Distribution = ({
  histogram,
  max,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  return (
    <Section
      title={title ?? 'Distribution'}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {histogram ? (
        <Graph
          distribution={histogram}
          isBottomAxisDisplayed
          isGridDisplayed
          isTooltipDisplayed
          rangeEnd={max}
          height={200}
          width={270}
          fill="#2972E1"
        />
      ) : (
        'MISSING'
      )}
    </Section>
  );
};
