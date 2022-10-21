import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const TabbableButton = styled(Button).attrs({
  type: 'ghost',
})`
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  margin: 0;
  border: none;
  height: max-content;
  border-radius: 1px;

  &:hover {
    background: none;
  }

  && {
    padding: 0px;
  }
`;
