import { Column } from '@tanstack/table-core';
import React, { FC, useRef } from 'react';
import { Button, Checkbox, Dropdown, Icon, Menu } from '@cognite/cogs.js';

import styled from 'styled-components';
import { TableData } from './Table';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier, XYCoord } from 'dnd-core';

export interface ColumnToggleProps<T extends TableData = any> {
  allColumns: Column<T, unknown>[];
  toggleAllColumnsVisible: (visible: boolean) => void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

export interface CardProps {
  id: any;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

export const ItemTypes = {
  CARD: 'card',
};

const style = {
  backgroundColor: 'white',
};

interface DragItem {
  index: number;
  accessor: string;
}

//Modified the example from here https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
export const MenutItemDrag: FC<CardProps> = ({
  id,
  index,
  moveCard,
  children,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!previewRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = previewRef.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(dragRef);
  drop(preview(previewRef));
  return (
    <FlexWrapper
      className="cogs-menu-item"
      ref={previewRef}
      style={{ ...style, opacity }}
      data-handler-id={handlerId}
    >
      <DragHandleWrapper ref={dragRef}>
        <Icon type="DragHandleVertical" />
      </DragHandleWrapper>
      {children}
    </FlexWrapper>
  );
};
export function ColumnToggle<T>({
  allColumns,
  moveCard,
  toggleAllColumnsVisible,
}: ColumnToggleProps<T>) {
  const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }));

  const allChecked = allColumns.every(column => column.getIsVisible());
  const someChecked = allColumns.some(column => column.getIsVisible());

  return (
    <Dropdown
      content={
        <StyledMenu ref={drop}>
          <Menu.Header>Table Columns</Menu.Header>
          <FlexWrapper className="cogs-menu-item">
            <Label>
              <Checkbox
                name={'selectAll'}
                indeterminate={!allChecked && someChecked}
                onChange={checked => {
                  toggleAllColumnsVisible(
                    !allChecked && someChecked ? true : checked
                  );
                }}
                className="cogs-checkbox__checkbox"
                checked={someChecked}
              />
              Select All
            </Label>
          </FlexWrapper>
          <Menu.Divider />
          {allColumns.map((column, index) => (
            <MenutItemDrag
              index={index}
              id={column.id}
              key={column.id}
              moveCard={moveCard}
            >
              <Label>
                <Checkbox
                  name={column.id}
                  checked={column.getIsVisible()}
                  onChange={() => {
                    column.toggleVisibility();
                  }}
                  className="cogs-checkbox__checkbox"
                  disabled={!column.getCanHide()}
                />
                {column.columnDef.header}
              </Label>
            </MenutItemDrag>
          ))}
        </StyledMenu>
      }
    >
      <Button icon="SplitView" aria-label="Column Selection" />
    </Dropdown>
  );
}

const StyledMenu = styled(Menu)`
  min-width: 200px;
  max-height: 320px;
  overflow: auto;
  display: block;
`;

const Label = styled.label`
  gap: 8px;
  display: flex;
  align-items: center;
  font: inherit;
`;

const DragHandleWrapper = styled.div`
  cursor: move;
`;

const FlexWrapper = styled.div`
  display: flex;
  min-height: 36px;

  align-items: center;
`;
