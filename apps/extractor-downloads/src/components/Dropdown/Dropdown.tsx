import styled from 'styled-components';

import {
  Button,
  Dropdown as CogsDropdown,
  DropdownProps as CogsDropdownProps,
  IconType,
  Menu,
} from '@cognite/cogs.js';

type DropdownProps = CogsDropdownProps & {
  title: string;
  options: { label: string; icon: IconType; onClick: () => void }[];
};

const StyledCogsDropdown = styled(CogsDropdown)``;
export const Dropdown = ({ title, options }: DropdownProps): JSX.Element => {
  return (
    <StyledCogsDropdown
      openOnHover
      content={
        <Menu style={{ width: 296, padding: 8 }}>
          {options &&
            options.map((option) => (
              <Menu.Item {...option} iconPlacement="left">
                {option.label}
              </Menu.Item>
            ))}
        </Menu>
      }
    >
      <Button
        type="primary"
        icon="ChevronDown"
        iconPlacement="right"
        style={{ width: '100%' }}
      >
        {title}
      </Button>
    </StyledCogsDropdown>
  );
};

export default Dropdown;
