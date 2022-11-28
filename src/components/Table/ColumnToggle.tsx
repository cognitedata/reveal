import { Column, Updater, ColumnOrderState } from '@tanstack/table-core';
import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Dropdown,
  Flex,
  Input,
  Menu,
  Label,
  SegmentedControl,
} from '@cognite/cogs.js';

import styled from 'styled-components';
import { MetadataHeaderText, TableData } from '../Table';

import {
  DragDropContainer,
  DragHandleIcon,
  WithDragHandleProps,
} from 'components/DragDropContainer';
import { HighlightCell } from './HighlightCell';

export interface ColumnToggleProps<T extends TableData = any> {
  allColumns: () => Column<T, unknown>[];
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
    <FlexWrapper className="cogs-menu-item" style={style}>
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
}: ColumnToggleProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [tab, setTab] = useState('All');

  const elementOrders = allColumns().map(column => column.id);

  const handleTabClick = (key: string) => {
    setTab(key);
  };

  const filteredColumns = allColumns().filter(column =>
    column.columnDef.header?.toString().toLowerCase().includes(searchInput)
  );
  const selectedColumns = filteredColumns.filter(column =>
    column.getIsVisible()
  );

  const selectedTabColumns = tab === 'All' ? filteredColumns : selectedColumns;

  const selectedColumnsCount = allColumns().reduce((accumulator, item) => {
    return item.getIsVisible() ? accumulator + 1 : accumulator;
  }, 0);

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
              <StyledCountLabel size="small" variant="unknown">
                {selectedColumnsCount}
              </StyledCountLabel>
            </SegmentedControl.Button>
          </SegmentedControl>

          <StyledInput
            type="search"
            clearable={{ callback: () => setSearchInput('') }}
            placeholder="Filter by name"
            fullWidth
            variant="noBorder"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />

          <DragDropContainer
            direction="vertical"
            id="column-toggle"
            elementsOrder={elementOrders}
            onDragEnd={onColumnOrderChanged}
          >
            {selectedTabColumns.map(column => {
              return (
                <MenutItemDrag
                  key={column.id}
                  isDragEnabled={!Boolean(searchInput)}
                >
                  <StyledLabel>
                    <Checkbox
                      name={column.id}
                      checked={column.getIsVisible()}
                      onChange={() => {
                        column.toggleVisibility();
                      }}
                      className="cogs-checkbox__checkbox"
                      disabled={!column.getCanHide()}
                    />
                    <Flex direction="column">
                      <StyledHeader
                        text={column.columnDef.header?.toString()}
                      />
                      {column.columnDef.meta && (
                        <MetadataHeaderText>Metadata</MetadataHeaderText>
                      )}
                    </Flex>
                  </StyledLabel>
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
  min-width: 256px;
  max-width: 256px;
  width: 100%;
  max-height: 320px;
  overflow: auto;
`;

const StyledHeader = styled(HighlightCell)`
  max-width: 170px;
  text-transform: capitalize;
`;

const StyledLabel = styled.label`
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

export const StyledInput = styled(Input)`
  margin-top: 8px;
`;

export const StyledCountLabel = styled(Label)`
  margin-left: 6px;
`;
