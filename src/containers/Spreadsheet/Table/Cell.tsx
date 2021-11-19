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

  return (
    <CellContainer
      onClick={onCellSelect}
      $selected={isCellSelected(rowIndex, columnIndex)}
    >
      {cellData}
    </CellContainer>
  );
};

export const CellContainer = styled.div<{ $selected: boolean }>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  padding: ${({ $selected }) => ($selected ? '6px 14px' : '8px 16px')};
  border-radius: ${({ $selected }) => $selected && '4px'};
  border: ${({ $selected }) =>
    $selected && `2px solid ${Colors.midblue.hex()}`};
`;

const _CellSelected = styled.div`
  border: 2px solid ${Colors.midblue.hex()} !important;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 6px 14px;
`;
