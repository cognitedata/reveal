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
    document.addEventListener('mousedown', onCellClickOutside);
    return () => {
      document.removeEventListener('mousedown', onCellClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onCellSelect = () =>
    setSelectedCell({ rowIndex, columnIndex, cellData });
  const onCellClickOutside = (event: MouseEvent) => {
    const element = (selectedCellRef as React.MutableRefObject<HTMLDivElement>)
      ?.current;
    if (!element) return;
    if (element && !element.contains(event.target as Node)) deselectCell();
  };

  if (columnIndex === 0) {
    return <StyledCellIndexColumn>{cellData}</StyledCellIndexColumn>;
  }
  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect} ref={selectedCellRef}>
      <StyledCellContent isOverflow={isOverflow}>{cellData}</StyledCellContent>
      {isOverflow && <ExpandButton />}
    </StyledCellSelected>
  ) : (
    <StyledCellUnselected onClick={onCellSelect}>
      {cellData}
    </StyledCellUnselected>
  );
};
