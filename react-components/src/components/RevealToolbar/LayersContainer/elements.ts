/*!
 * Copyright 2023 Cognite AS
 */

import { Chip } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledChipCount = styled(Chip)`
  && {
    border-radius: 2px;
    width: fit-content;
    height: 20px;
    max-height: 20px;
    min-height: 20px;
    min-width: 20px;
    padding: 4px;
  }
`;

export const StyledLabel = styled.div`
  /* Font */
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
`;
