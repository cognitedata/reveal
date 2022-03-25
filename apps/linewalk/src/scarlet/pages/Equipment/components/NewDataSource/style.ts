import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const NewSourceButton = styled(Button)`
  color: var(--cogs-midblue-3);
  border: 1px solid currentColor;
  width: 100%;
  padding: 16px !important;
  border-radius: 8px !important;
  height: auto;
  position: relative;
  justify-content: left;
`;

export const Chevron = styled.div`
  border-left: 1px solid currentColor;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
