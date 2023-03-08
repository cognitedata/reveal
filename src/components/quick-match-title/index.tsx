import { Flex, Icon, Title, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { QuickMatchStep } from 'context/QuickMatchContext';

type QuickMatchTitleProps = {
  step: QuickMatchStep;
};

export default function QuickMatchTitle({ step }: QuickMatchTitleProps) {
  const { t } = useTranslation();

  return (
    <Flex alignItems="center" gap={8}>
      <Title level={3}>{t(`title-${step}`)}</Title>
      <Tooltip content={t('select-data-tooltip')} placement="bottom">
        <Icon type="InfoFilled" />
      </Tooltip>
    </Flex>
  );
}
