import { Flex, Icon, Title, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import { useQuickMatchContext } from 'context/QuickMatchContext';

export default function QuickMatchTitle() {
  const { t } = useTranslation();
  const { step } = useQuickMatchContext();

  return (
    <Flex alignItems="center" gap={8}>
      <Title level={3}>{t(`title-${step}`)}</Title>
      <Tooltip content={t('select-data-tooltip')} placement="bottom">
        <Icon type="InfoFilled" />
      </Tooltip>
    </Flex>
  );
}
