import React from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import { Section } from '@raw-explorer/components/ProfilingSection';
import Distribution from '@raw-explorer/containers/Profiling/Distribution';
import { Count } from '@raw-explorer/hooks/profiling-service';

import { Flex } from '@cognite/cogs.js';

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
  const { t } = useTranslation();
  const height = isCompact ? 200 : 330;
  return (
    <Section
      title={title ?? t('profiling-sidebar-distribution-title')}
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
        t('profiling-sidebar-value-missing')
      )}
    </Section>
  );
};
