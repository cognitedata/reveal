import { Column, Updater, ColumnOrderState } from '@tanstack/table-core';
import React, { useState, useMemo } from 'react';
import {
  Button,
  Checkbox,
  Detail,
  Dropdown,
  Flex,
  Input,
  Menu,
  SegmentedControl,
} from '@cognite/cogs.js';
import { useDebounce } from 'use-debounce';

import styled from 'styled-components';
import { TableData } from '../Table';

import {
  DragDropContainer,
  DragHandleIcon,
  WithDragHandleProps,
} from 'components/DragDropContainer';
import { HighlightCell } from './HighlightCell';

export interface ColumnToggleProps<T extends TableData = any> {
  allColumns: Column<T, unknown>[];
  toggleAllColumnsVisible: (visible: boolean) => void;
  onColumnOrderChanged: (updater: Updater<ColumnOrderState>) => void;
}

const style = {
  backgroundColor: 'white',
};

//Modified the example from here https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
export const MenutItemDrag: React.FC<
  WithDragHandleProps<{ isDragEnabled?: boolean }>
> = ({ dragHandleProps, children, isDragEnabled }) => {
  return (
    <FlexWrapper className="cogs-menu-item" style={{ ...style }}>
      {isDragEnabled && (
        <DragHandleIcon.Vertical dragHandleProps={dragHandleProps} />
      )}
      {children}
    </FlexWrapper>
  );
};
export function ColumnToggle<T>({
  allColumns,
  onColumnOrderChanged,
  toggleAllColumnsVisible,
}: ColumnToggleProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const allChecked = allColumns.every(column => column.getIsVisible());
  const someChecked = allColumns.some(column => column.getIsVisible());
  const selectedColumns = allColumns.filter(column => column.getIsVisible());

  const elementOrders = allColumns.map(column => column.id);
  const [tab, setTab] = useState('All');
  const handleTabClick = (key: string) => {
    setTab(key);
  };

  const [debouncedSearchInput] = useDebounce(searchInput, 200);

  const filteredColumns = useMemo(
    () =>
      allColumns.filter(column =>
        column.columnDef.header
          ?.toString()
          .toLowerCase()
          .includes(debouncedSearchInput)
      ),

    [allColumns, debouncedSearchInput]
  );

  const selectedTabColumns = tab === 'All' ? filteredColumns : selectedColumns;

  return (
    <Dropdown
      content={
        <StyledMenu>
          <SegmentedControl
            fullWidth
            onButtonClicked={handleTabClick}
            currentKey={tab}
          >
            <SegmentedControl.Button key="All">All</SegmentedControl.Button>
            <SegmentedControl.Button key="Selected">
              Selected
            </SegmentedControl.Button>
          </SegmentedControl>
          <Menu.Header>Table Columns</Menu.Header>
          {tab === 'All' && (
            <div>
              <Input
                type="search"
                clearable={{ callback: () => setSearchInput('') }}
                placeholder="Filter by name"
                fullWidth
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
          )}
          {tab === 'All' && (
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
          )}
          <Menu.Divider />

          <DragDropContainer
            direction="vertical"
            id="column-toggle"
            elementsOrder={elementOrders}
            onDragEnd={onColumnOrderChanged}
          >
            {selectedTabColumns.map(column => {
              return (
                <MenutItemDrag key={column.id} isDragEnabled={!isActive}>
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
                    <Flex direction="column" gap={4}>
                      <StyledHeader
                        text={column.columnDef.header?.toString()}
                      />
                      {column.columnDef.meta && <Detail>Metadata</Detail>}
                    </Flex>
                  </Label>
                </MenutItemDrag>
              );
            })}
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
  max-width: 200px;
  width: 100%;
  max-height: 320px;
  overflow: auto;
  display: block;
`;

const StyledHeader = styled(HighlightCell)`
  max-width: 110px;
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
