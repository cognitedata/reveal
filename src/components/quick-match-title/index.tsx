import { Flex, Icon, Title, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import {
  QuickMatchStep,
  useQuickMatchContext,
} from 'context/QuickMatchContext';

export default function QuickMatchTitle() {
  const { t } = useTranslation();
  const { step } = useQuickMatchContext();

  const titles: Record<QuickMatchStep, string> = {
    sourceSelect: t('title-select-entities'),
    targetSelect: t('title-select-assets'),
    modelParams: t('title-configure-model'),
    viewModel: t('title-view-model-result'),
  };

  return (
    <Flex alignItems="center" gap={8}>
      <Title level={3}>{titles[step]}</Title>
      <Tooltip content={t('select-data-tooltip')} placement="bottom">
        <Icon type="InfoFilled" />
      </Tooltip>
    </Flex>
  );
}
