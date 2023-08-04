import { Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';

export const MenuItemOpenInCharts = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Menu.Item iconPlacement="left" icon="LineChart" onClick={onClick}>
      {t('GENERAL_APP_CHARTS')}
    </Menu.Item>
  );
};
