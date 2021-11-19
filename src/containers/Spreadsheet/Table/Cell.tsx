import React from 'react';
import styled from 'styled-components';

import { Button, Colors, Flex, Icon } from '@cognite/cogs.js';

import { useTableSelection } from 'hooks/table-selection';

const NO_CELL_SELECTED = { rowIndex: undefined, columnIndex: undefined };

type Props = {
  cellData?: string | undefined;
  columnIndex?: number | undefined;
  rowIndex?: number | undefined;
};

export const Cell = (props: Props): JSX.Element => {
  const { cellData, columnIndex = -1, rowIndex = -1 } = props;
  const { selectedCell, setSelectedCell, isCellSelected } = useTableSelection();

  const onCellSelect = () => {
    const isClickedCellSelected =
      rowIndex === selectedCell.rowIndex &&
      columnIndex === selectedCell.columnIndex;
    if (isClickedCellSelected) setSelectedCell(NO_CELL_SELECTED);
    else setSelectedCell({ rowIndex, columnIndex });
  };

  const isSelected = isCellSelected(rowIndex, columnIndex);
  const isOverflow = true; // mock

  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect}>
      <StyledCellContent isOverflow={isOverflow}>{cellData}</StyledCellContent>
      {isOverflow && (
        <ExpandButton type="primary" size="small" style={{ padding: 0 }}>
          <Icon type="Expand" />
        </ExpandButton>
      )}
    </StyledCellSelected>
  ) : (
    <StyledCellUnselected onClick={onCellSelect}>
      {cellData}
    </StyledCellUnselected>
  );
};

const StyledCell = styled.div`
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  background-color: white;
`;

const StyledCellUnselected = styled(StyledCell)`
  height: 100%;
  padding: 8px 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
`;

const StyledCellSelected = styled(StyledCell)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  height: auto;
  max-height: 200%;
  z-index: 10;
  padding: 6px 14px;
  border-radius: 4px;
  border: 2px solid ${Colors.midblue.hex()};
`;

const StyledCellContent = styled.div<{ isOverflow: boolean }>`
  max-width: ${({ isOverflow }) => (isOverflow ? '90%' : '100%')};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ExpandButton = styled(Button)`
  padding: 0;
  margin: 0 4px;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  font-size: 0.5em;
  align-self: center;
`;
