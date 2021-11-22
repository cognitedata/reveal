import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@cognite/cogs.js';

import { useTableSelection } from 'hooks/table-selection';
import {
  StyledCellIndexColumn,
  StyledCellUnselected,
  StyledCellSelected,
  StyledCellContent,
  ExpandButton,
} from './Cell.styles';

const NO_CELL_SELECTED = { rowIndex: undefined, columnIndex: undefined };

type Props = {
  cellData?: string | undefined;
  columnIndex?: number | undefined;
  rowIndex?: number | undefined;
};

export const Cell = (props: Props): JSX.Element => {
  const { cellData, columnIndex = -1, rowIndex = -1 } = props;
  const { selectedCell, setSelectedCell, isCellSelected } = useTableSelection();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [isOverflow, setIsOverflow] = useState<boolean>(false);
  const selectedCellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = selectedCellRef?.current;
    if (!isSelected || !element) return;
    const hasOverflowingChildren =
      element.offsetHeight < element.scrollHeight ||
      element.offsetWidth < element.scrollWidth;
    setIsOverflow(hasOverflowingChildren);
  }, [isSelected]);

  useEffect(() => {
    setIsSelected(isCellSelected(rowIndex, columnIndex));
  }, [selectedCell]);

  const onCellSelect = () => {
    const isClickedCellSelected =
      rowIndex === selectedCell.rowIndex &&
      columnIndex === selectedCell.columnIndex;
    if (isClickedCellSelected) setSelectedCell(NO_CELL_SELECTED);
    else setSelectedCell({ rowIndex, columnIndex });
  };

  if (columnIndex === 0) {
    return <StyledCellIndexColumn>{cellData}</StyledCellIndexColumn>;
  }
  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect}>
      <StyledCellContent ref={selectedCellRef} isOverflow={isOverflow}>
        {cellData}
      </StyledCellContent>
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
