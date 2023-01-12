import styled from 'styled-components/macro';

import { Button, Label } from '@cognite/cogs.js';

export const StyledChip = styled(Label)`
  && {
    width: fit-content;
    max-height: 28px;
  }
`;
export const CloseButton = styled(Button).attrs({
  icon: 'Close',
  'aria-label': 'Close filter',
  type: 'ghost',
  size: 'small',
  'data-testid': 'close-button',
})`
  &:hover {
    background: transparent !important;
  }
`;

export const Title = styled.div`
  max-width: 300px;
  text-overflow: ellipsis;
  display: block !important;
  white-space: nowrap;
  overflow: hidden;
`;
