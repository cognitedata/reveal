import styled from 'styled-components';

import { Dropdown, Menu, MenuProps } from 'antd';
import { DropdownProps } from 'antd/lib/dropdown';

import { Button, ButtonProps, Colors, Flex } from '@cognite/cogs.js';

export type SplitButtonProps = {
  dropdownTrigger?: DropdownProps['trigger'];
  menuItems: MenuProps['items'];
} & ButtonProps;

/**
 * This is a generic component that should be moved to a util library after trials and fixes.
 */
const SplitButton = ({
  dropdownTrigger = ['click'],
  menuItems,
  ...buttonProps
}: SplitButtonProps) => {
  return (
    <Flex direction="row">
      <StyledButton {...buttonProps} />
      <Dropdown
        disabled={buttonProps.loading || buttonProps.disabled}
        overlay={<Menu items={menuItems} />}
        trigger={dropdownTrigger}
        placement="bottomRight"
      >
        <StyledDropdownButton size={buttonProps.size} />
      </Dropdown>
    </Flex>
  );
};

const StyledButton = styled(Button)`
  &&& {
    border-right: 1px solid ${Colors['border--muted']};
    border-radius: var(--cogs-btn-border-radius) 0 0
      var(--cogs-btn-border-radius);
  }
`;

const StyledDropdownButton = styled(Button).attrs({
  icon: 'ChevronDown',
  'aria-label': 'Open Dropdown',
})`
  &&& {
    border-radius: 0 var(--cogs-btn-border-radius) var(--cogs-btn-border-radius)
      0;
  }
`;

export default SplitButton;
