import styled from 'styled-components/macro';

import { Flex } from '@cognite/cogs.js';

export const CustomForm = styled(Flex)`
  max-height: 500px;
  overflow: auto;
  padding-right: 10px;
  .config-textarea-container {
    display: flex;
    flex-direction: column;
  }
`;
