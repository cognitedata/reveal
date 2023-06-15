import React, { CSSProperties, useEffect, useRef, useState } from 'react';

import { useCellSelection } from '@transformations/hooks/table-selection';

import { Icon } from '@cognite/cogs.js';

import {
  StyledCellIndexColumn,
  StyledCellUnselected,
  StyledCellSelected,
  StyledCellContent,
  StyledExpandButton,
} from './Cell.styles';

type Props = {
  cellData?: string | undefined;
  columnIndex?: number | undefined;
  rowIndex?: number | undefined;
  style?: CSSProperties;
};

export const Cell = (props: Props): JSX.Element => {
  const { cellData, columnIndex = -1, rowIndex = -1 } = props;
  const { selectedCell, setSelectedCell, isCellSelected, setIsCellExpanded } =
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

  const onCellSelect = (event: React.MouseEvent) => {
    setSelectedCell({ rowIndex, columnIndex, cellData });
    // This stops deselect on cell click
    event.stopPropagation();
  };

  const handleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedCell({ rowIndex, columnIndex, cellData });
    setIsCellExpanded(true);
  };

  if (columnIndex === 0) {
    return <StyledCellIndexColumn>{cellData}</StyledCellIndexColumn>;
  }
  return isSelected ? (
    <StyledCellSelected onClick={onCellSelect} ref={selectedCellRef}>
      <StyledCellContent isOverflow={isOverflow}>{cellData}</StyledCellContent>
      {isOverflow && (
        <StyledExpandButton
          type="primary"
          size="small"
          onClick={handleExpand}
          style={{ padding: '4px' }}
        >
          <Icon type="Expand" />
        </StyledExpandButton>
      )}
    </StyledCellSelected>
  ) : (
    <StyledCellUnselected onClick={onCellSelect} style={props.style}>
      {cellData}
    </StyledCellUnselected>
  );
};
