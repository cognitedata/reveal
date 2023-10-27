import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Menu } from '@cognite/cogs.js';

export const MenuItemOpenInCanvas = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();

  return (
    <Menu.Item iconPlacement="left" icon="Canvas" onClick={onClick}>
      {t('GENERAL_APP_INDUSTRIAL_CANVAS')}
    </Menu.Item>
  );
};
