import { Icon, Title, Tooltip } from '@cognite/cogs.js';
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
    <Title level={2} style={{ marginBottom: 20 }}>
      {titles[step]}
      <Tooltip content={t('select-data-tooltip')} placement="bottom">
        <Icon type="Info" />
      </Tooltip>
    </Title>
  );
}
