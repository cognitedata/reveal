import styled from 'styled-components';

import { Button, Colors } from '@cognite/cogs.js';

export const ExactMatchLabel = styled(Button)`
  && {
    background-color: ${Colors['decorative--green--200']};
    font-size: 10px;
    height: 20px;
    padding: 10px;
    margin-left: 16px;
  }
`;
