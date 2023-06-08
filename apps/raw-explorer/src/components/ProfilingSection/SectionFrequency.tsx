import React from 'react';

import FrequencyStats, { Count } from 'containers/Profiling/FrequencyStats';
import { Section } from 'components/ProfilingSection';
import { useTranslation } from 'common/i18n';

type Props = {
  allCount: number;
  counts?: Count[];
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const SectionFrequency = ({
  allCount,
  counts,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Section
      title={title ?? t('profiling-sidebar-frequency-title')}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {counts ? (
        <FrequencyStats allCount={allCount} counts={counts} />
      ) : (
        t('profiling-sidebar-value-missing')
      )}
    </Section>
  );
};
