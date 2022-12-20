import { Flex } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledCommonError = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  .cogs-graphic {
    margin-bottom: 32px;
  }

  .cogs-title-5 {
    margin-bottom: 8px;
  }

  .cogs-body-1 {
    text-align: center;
  }

  .cogs-btn {
    margin-top: 24px;
  }
`;
