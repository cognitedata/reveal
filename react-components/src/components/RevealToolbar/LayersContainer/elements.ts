/*!
 * Copyright 2023 Cognite AS
 */

import { Checkbox, Chip, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`;

export const StyledMenu = styled(Menu)`
  padding: 6px;
`;

export const StyledSubMenu = styled(Menu)`
  box-shadow: none;
  padding: 8px;
`;

export const StyledChipCount = styled(Chip)`
  && {
    background: #5874ff;
    border-radius: 2px;
    width: fit-content;
    height: 20px;
    max-height: 20px;
    min-height: 20px;
    min-width: 20px;
    padding: 4px;
    color: #ffffff;

    /* Font */
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
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
