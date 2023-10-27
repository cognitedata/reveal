import { PropsWithChildren } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';

import { Dropdown, DropdownProps } from '@cognite/cogs.js';

import { Menu } from '../menu/Menu';

interface Props extends DropdownProps {
  onCanvasClick?: () => void;
  onChartsClick?: () => void;
}
export const OpenInDropdown = ({
  children,
  onCanvasClick,
  onChartsClick,
  disabled,
  placement = 'bottom-end',
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();

  return (
    <Dropdown
      placement={placement}
      content={
        <Menu>
          <Menu.Header>{t('GENERAL_OPEN_IN')}</Menu.Header>
          {onCanvasClick && <Menu.OpenInCanvas onClick={onCanvasClick} />}
          {onChartsClick && <Menu.OpenInCharts onClick={onChartsClick} />}
        </Menu>
      }
      disabled={disabled}
    >
      {children as any}
    </Dropdown>
  );
};
