import { useTranslation } from '@transformations/common/i18n';
import { Section } from '@transformations/components/profiling-section';

import { Body, Flex, Chip } from '@cognite/cogs.js';

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
  const percentage =
    allCount !== 0 ? Math.ceil((distinctCount / allCount) * 100) : 0;
  const variant = percentage === 100 ? 'success' : 'default';
  const { t } = useTranslation();

  return (
    <Section
      title={title ?? t('distinct-values')}
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
          size="x-small"
          type={variant}
          label={t('percent-unique-value', { percentage })}
        />
      </Flex>
    </Section>
  );
};
