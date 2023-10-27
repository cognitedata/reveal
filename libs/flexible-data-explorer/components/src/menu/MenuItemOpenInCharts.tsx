import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Menu } from '@cognite/cogs.js';

export const MenuItemOpenInCharts = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Menu.Item iconPlacement="left" icon="LineChart" onClick={onClick}>
      {t('GENERAL_APP_CHARTS')}
    </Menu.Item>
  );
};
