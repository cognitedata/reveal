import { Column, Updater, ColumnOrderState } from '@tanstack/table-core';
import React from 'react';
import { Button, Checkbox, Dropdown, Menu } from '@cognite/cogs.js';

import styled from 'styled-components';
import { TableData } from '../Table';

import {
  DragDropContainer,
  DragHandleIcon,
  WithDragHandleProps,
} from 'components/DragDropContainer';

export interface ColumnToggleProps<T extends TableData = any> {
  allColumns: Column<T, unknown>[];
  toggleAllColumnsVisible: (visible: boolean) => void;
  onColumnOrderChanged: (updater: Updater<ColumnOrderState>) => void;
}

const style = {
  backgroundColor: 'white',
};

//Modified the example from here https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
export const MenutItemDrag: React.FC<WithDragHandleProps<any>> = ({
  dragHandleProps,
  children,
}) => {
  return (
    <FlexWrapper className="cogs-menu-item" style={{ ...style }}>
      <DragHandleIcon.Vertical dragHandleProps={dragHandleProps} />
      {children}
    </FlexWrapper>
  );
};
export function ColumnToggle<T>({
  allColumns,
  onColumnOrderChanged,
  toggleAllColumnsVisible,
}: ColumnToggleProps<T>) {
  const allChecked = allColumns.every(column => column.getIsVisible());
  const someChecked = allColumns.some(column => column.getIsVisible());

  const elementOrders = allColumns.map(column => column.id);

  return (
    <Dropdown
      content={
        <StyledMenu>
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
          <DragDropContainer
            direction="vertical"
            id="column-toggle"
            elementsOrder={elementOrders}
            onDragEnd={onColumnOrderChanged}
          >
            {allColumns.map(column => (
              <MenutItemDrag key={column.id}>
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
          </DragDropContainer>
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

const FlexWrapper = styled.div`
  display: flex;
  min-height: 36px;

  align-items: center;
`;
