import { FormEventHandler } from 'react';

import { Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../../hooks/useTranslation';
import { StyledRevealToolBar } from '../components/ToolBar/StyledRevealToolBar';

type ToolBarContainerProps = {
  hasOriginalCadColors: boolean;
  onToggleOriginalColors: FormEventHandler<HTMLElement>;
};

export const ToolBarContainer = ({
  hasOriginalCadColors,
  onToggleOriginalColors,
}: ToolBarContainerProps) => {
  const { t } = useTranslation();
  return (
    <StyledRevealToolBar
      customSettingsContent={
        <>
          <Menu.Item
            hasSwitch
            toggled={hasOriginalCadColors}
            onChange={onToggleOriginalColors}
          >
            {t('3D_TOOLBAR_CAD_COLOR_TOGGLE')}
          </Menu.Item>
        </>
      }
    />
  );
};
