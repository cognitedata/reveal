import { Button, ButtonProps, Colors, Menu } from '@cognite/cogs.js';

import Dropdown from 'components/dropdown/Dropdown';
import styled from 'styled-components';

type RowActionsProps = {
  actions: Omit<ButtonProps, 'type'>[];
};

const RowActions = ({ actions }: RowActionsProps): JSX.Element => {
  return (
    <Dropdown
      content={
        <Menu>
          {actions.map((buttonProps) => (
            <Menu.Item iconPlacement="left" {...buttonProps} />
          ))}
        </Menu>
      }
      placement="bottom-end"
    >
      <StyledButton
        aria-label="Options"
        icon="EllipsisHorizontal"
        type="ghost"
      />
    </Dropdown>
  );
};

export default RowActions;

const StyledButton = styled(Button)`
  &:hover {
    background-color: ${Colors['surface--interactive--toggled-hover']};
    color: ${Colors['decorative--blue--300']};
  }

  &:active {
    background-color: ${Colors['surface--interactive--toggled-pressed']};
    color: ${Colors['decorative--blue--300']};
  }
`;
