import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

type ListItemProps = {
  isActive?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const ListItem = ({
  children,
  isActive = false,
  ...buttonProps
}: ListItemProps) => (
  <StyledButton $isActive={isActive} {...buttonProps}>
    {children}
  </StyledButton>
);

const StyledButton = styled.button<{ $isActive?: boolean }>`
  border: none;
  text-align: inherit;

  background-color: ${({ $isActive }) =>
    $isActive
      ? Colors['surface--interactive--toggled-default']
      : Colors['surface--medium']};
  padding: 12px;
  border-radius: 7px;

  &:hover {
    background-color: ${({ $isActive }) =>
      $isActive
        ? Colors['surface--interactive--toggled-hover']
        : Colors['surface--interactive--hover']};
  }
  &:active {
    background-color: ${({ $isActive }) =>
      $isActive
        ? Colors['surface--interactive--toggled-pressed']
        : Colors['surface--interactive--pressed']};
  }
`;

export default ListItem;
