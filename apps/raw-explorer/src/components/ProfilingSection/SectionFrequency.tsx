import React from 'react';

import { useTranslation } from '@raw-explorer/common/i18n';
import { Section } from '@raw-explorer/components/ProfilingSection';
import FrequencyStats, {
  Count,
} from '@raw-explorer/containers/Profiling/FrequencyStats';

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
