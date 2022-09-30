import {
  ColumnInstance,
  IdType,
  TableToggleHideAllColumnProps,
} from 'react-table';
import React, { FC, useRef } from 'react';
import { Button, Checkbox, Dropdown, Icon, Menu } from '@cognite/cogs.js';

import styled from 'styled-components';
import { TableData } from './Table';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier, XYCoord } from 'dnd-core';

interface ColumnToggleProps<T extends TableData = any> {
  allColumns: ColumnInstance<T>[];
  getToggleHideAllColumnsProps?: (
    props?: Partial<TableToggleHideAllColumnProps>
  ) => TableToggleHideAllColumnProps | void;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  setHiddenColumns: (param: IdType<T>[]) => void;
  alwaysColumnVisible?: string;
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
        <Icon type="DragHandleVertical" />{' '}
      </DragHandleWrapper>
      {children}
    </FlexWrapper>
  );
};
export function ColumnToggle<T>({
  allColumns,
  moveCard,
  getToggleHideAllColumnsProps = () => {},
  alwaysColumnVisible = 'name',
  setHiddenColumns,
}: ColumnToggleProps<T>) {
  const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }));

  return (
    <Dropdown
      content={
        <StyledMenu ref={drop}>
          <Menu.Header>Columns rearrangement</Menu.Header>
          <FlexWrapper className="cogs-menu-item">
            <Label>
              <IndeterminateCheckbox
                setHiddenColumns={setHiddenColumns}
                allColumns={allColumns as any}
                alwaysColumnVisible={alwaysColumnVisible}
                {...getToggleHideAllColumnsProps()}
              />
              Select All
            </Label>
          </FlexWrapper>
          {allColumns.map((column, index) => (
            <MenutItemDrag
              index={index}
              id={column.id}
              key={column.id}
              moveCard={moveCard}
            >
              <Label>
                <Checkbox
                  type="checkbox"
                  {...column.getToggleHiddenProps()}
                  onChange={(_, evt) =>
                    column.getToggleHiddenProps().onChange(evt)
                  }
                  className="cogs-checkbox__checkbox"
                  disabled={alwaysColumnVisible === column.id}
                  defaultChecked={alwaysColumnVisible === column.id}
                />
                {column.Header}
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
  height: 192px;
  overflow: auto;
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
