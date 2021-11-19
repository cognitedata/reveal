import React from 'react';
import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

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

  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect}>{cellData}</StyledCellSelected>
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
`;

const StyledCellSelected = styled(StyledCell)`
  height: 200%;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 10;
  padding: 6px 14px;
  border-radius: 4px;
  border: 2px solid ${Colors.midblue.hex()};
`;
