import styled from 'styled-components';

import { Button, Colors } from '@cognite/cogs.js';

export const StyledCell = styled.div`
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
`;

export const StyledCellIndexColumn = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 8px;
  box-sizing: border-box;
  width: 100%;
  font-size: 0.9em;
  font-weight: 600;
  background-color: ${Colors['decorative--grayscale--100']};
`;

export const StyledCellUnselected = styled(StyledCell)`
  height: 100%;
  padding: 4px 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledCellSelected = styled(StyledCell)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  height: auto;
  min-height: 100%;
  max-height: 200%;
  z-index: 10;
  padding: 2px 10px;
  border-radius: 4px;
  border: 2px solid ${Colors['decorative--blue--500']};
  background-color: white;
`;

export const StyledCellContent = styled.div<{ isOverflow: boolean }>`
  max-width: ${({ isOverflow }) => (isOverflow ? '90%' : '100%')};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

export const StyledExpandButton = styled(Button)`
  margin: 0 4px;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  font-size: 0.5em;
  align-self: center;
`;
