import React from 'react';
import { Flex } from '@cognite/cogs.js';

import { Count } from 'hooks/profiling-service';

import Distribution from 'containers/Profiling/Distribution';
import { Section } from 'components/ProfilingSection';

type Props = {
  histogram?: Count[];
  max?: number;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const SectionDistribution = ({
  histogram,
  max,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  const height = isCompact ? 200 : 330;
  return (
    <Section
      title={title ?? 'Distribution'}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {histogram ? (
        <Flex
          direction="column"
          justifyContent="flex-end"
          style={{
            height,
            width: '100%',
          }}
        >
          <div style={{ height }}>
            <Distribution
              distribution={histogram}
              isBottomAxisDisplayed
              isGridDisplayed
              isTooltipDisplayed
              rangeEnd={max}
            />
          </div>
        </Flex>
      ) : (
        'MISSING'
      )}
    </Section>
  );
};
