/*!
 * Copyright 2023 Cognite AS
 */

import { Chip, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledSubMenu = styled(Menu)`
  padding: 8px;
  overflow-y: auto;
  border: 1px solid rgba(83, 88, 127, 0.24);
  max-height: 300px;
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 1px var(--cogs-surface--interactive--pressed);
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-code--medium);
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: var(--cogs-surface--status-undefined--muted--pressed);
  }
  ::-webkit-scrollbar-thumb:hover {
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-backdrop);
  }
`;

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
