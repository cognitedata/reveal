import styled from 'styled-components';
import { Infobar } from '@cognite/cogs.js-v9';

export const StyledInfobar = styled(Infobar)`
  .cogs-infobar__content {
    height: 40px;
  }
  .cogs.cogs-button {
    margin-left: 16px;

    &:hover {
      background: #f2f2f5;
    }
  }
`;
