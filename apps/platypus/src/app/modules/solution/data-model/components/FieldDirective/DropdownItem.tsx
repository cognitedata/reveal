import { Menu, Icon, Checkbox, IconType } from '@cognite/cogs.js';
import styled from 'styled-components';

type DropdownItemProps = {
  name: string;
  iconName: IconType;
  onItemClick: (directiveName: string) => void;
  getChecked: (name: string) => boolean;
  disabled: boolean;
};

export const DropdownItem = ({
  name,
  iconName,
  onItemClick,
  getChecked,
  disabled,
}: DropdownItemProps) => {
  return (
    <MenuItem
      onClick={(event) => {
        event.preventDefault();
        onItemClick(name);
      }}
      disabled={disabled}
    >
      <div>
        <Icon type={iconName} />
        {name[0].toUpperCase() + name.slice(1)}
      </div>
      <Checkbox checked={getChecked(name)} name={name} readOnly />
    </MenuItem>
  );
};

const MenuItem = styled(Menu.Item)`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;
