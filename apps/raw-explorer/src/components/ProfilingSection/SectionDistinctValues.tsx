import React from 'react';
import { Body, Flex, Chip } from '@cognite/cogs.js';

import { Section } from 'components/ProfilingSection';
import { useTranslation } from 'common/i18n';

type Props = {
  allCount: number;
  distinctCount: number;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};

export const SectionDistinctValues = ({
  allCount,
  distinctCount,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const percentage =
    allCount !== 0 ? Math.ceil((distinctCount / allCount) * 100) : 0;
  const variant = percentage === 100 ? 'success' : 'default';
  return (
    <Section
      title={title ?? t('profiling-sidebar-distinct-values-title')}
      isHalf={isHalf}
      isCompact={isCompact}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ width: '100%' }}
      >
        <Body level={2}>{distinctCount}</Body>
        <Chip
          label={t('profiling-sidebar-distinct-values-value', { percentage })}
          type={variant}
        ></Chip>
      </Flex>
    </Section>
  );
};
