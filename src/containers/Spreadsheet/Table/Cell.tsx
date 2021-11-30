import React, { useEffect, useRef, useState } from 'react';

import { useCellSelection } from 'hooks/table-selection';
import {
  StyledCellIndexColumn,
  StyledCellUnselected,
  StyledCellSelected,
  StyledCellContent,
} from './Cell.styles';
import { ExpandButton } from './ExpandButton';

type Props = {
  cellData?: string | undefined;
  columnIndex?: number | undefined;
  rowIndex?: number | undefined;
};

export const Cell = (props: Props): JSX.Element => {
  const { cellData, columnIndex = -1, rowIndex = -1 } = props;
  const { selectedCell, deselectCell, setSelectedCell, isCellSelected } =
    useCellSelection();
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
  }, [selectedCell, rowIndex, columnIndex, isCellSelected]);

  const onCellSelect = () => {
    const isClickedCellSelected =
      rowIndex === selectedCell.rowIndex &&
      columnIndex === selectedCell.columnIndex;
    if (isClickedCellSelected) deselectCell();
    else setSelectedCell({ rowIndex, columnIndex, cellData });
  };

  if (columnIndex === 0) {
    return <StyledCellIndexColumn>{cellData}</StyledCellIndexColumn>;
  }
  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect}>
      <StyledCellContent ref={selectedCellRef} isOverflow={isOverflow}>
        {cellData}
      </StyledCellContent>
      {isOverflow && <ExpandButton />}
    </StyledCellSelected>
  ) : (
    <StyledCellUnselected onClick={onCellSelect}>
      {cellData}
    </StyledCellUnselected>
  );
};
