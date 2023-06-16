import styled from 'styled-components';

import { TOOLTIP_DELAY_IN_MS } from '@transformations/common';

import { Button, IconType, Tooltip } from '@cognite/cogs.js';

export type SideMenuItem<T = string> = {
  icon: IconType;
  key: T;
  label: string;
};

type SideMenuProps<T> = {
  isSidePanelVisible?: boolean;
  items: SideMenuItem<T>[];
  onChange: (selectedItem: SideMenuItem<T>) => void;
  selectedItemKey?: SideMenuItem<T>['key'];
};

const SideMenu = <T extends string>({
  isSidePanelVisible,
  items,
  onChange,
  selectedItemKey,
}: SideMenuProps<T>): JSX.Element => {
  const handleChange = (item: SideMenuItem<T>): void => {
    onChange(item);
  };

  return (
    <StyledSideMenuContainer>
      {items.map((item) => (
        <Tooltip
          content={item.label}
          delay={TOOLTIP_DELAY_IN_MS}
          key={item.label}
          placement="right"
        >
          <StyledSideMenuButton
            icon={item.icon}
            onClick={() => handleChange(item)}
            type="ghost"
            toggled={selectedItemKey === item.key && isSidePanelVisible}
          />
        </Tooltip>
      ))}
    </StyledSideMenuContainer>
  );
};

const StyledSideMenuContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
`;

const StyledSideMenuButton = styled(Button)`
  padding: 10px 8px !important;
  width: 36px;
`;

export default SideMenu;
