import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const MenuButton = styled(Button)`
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  background-color: ${(props) => props.disabled && 'transparent'};
  color: ${(props) =>
    props.disabled && props.type === 'ghost-danger' && Colors['red-2'].hex()};

  &:hover {
    cursor: ${(props) => props.disabled && 'not-allowed'};
    background-color: ${(props) => props.disabled && 'transparent'};
    color: ${(props) =>
      props.disabled && props.type === 'ghost-danger' && Colors['red-2'].hex()};
  }
`;
