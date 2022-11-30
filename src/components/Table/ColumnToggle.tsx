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
  Infobar,
  Detail,
  Body,
} from '@cognite/cogs.js';

import styled from 'styled-components';
import { TableData } from './Table';
import { MetadataHeaderText } from './elements';

import {
  DragDropContainer,
  DragHandleIcon,
  WithDragHandleProps,
} from 'components/DragDropContainer';
import { HighlightCell } from './HighlightCell';
import { MAX_COLUMN_SELECTION } from 'index';

export interface ColumnToggleProps<T extends TableData = any> {
  allColumns: () => Column<T, unknown>[];
  toggleAllColumnsVisible: (visible: boolean) => void;
  onColumnOrderChanged: (updater: Updater<ColumnOrderState>) => void;
  onResetSelectedColumns: () => void;
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
  onResetSelectedColumns,
}: ColumnToggleProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [tab, setTab] = useState('All');

  const elementOrders = allColumns().map(column => column.id);

  const filteredColumns = allColumns().filter(column =>
    column.columnDef.header?.toString().toLowerCase().includes(searchInput)
  );
  const isSearchResultEmpty = filteredColumns.length === 0;

  const selectedColumns = filteredColumns.filter(column =>
    column.getIsVisible()
  );
  const selectedTabColumns = tab === 'All' ? filteredColumns : selectedColumns;

  const selectedColumnsCount = allColumns().reduce((accumulator, item) => {
    return item.getIsVisible() ? accumulator + 1 : accumulator;
  }, 0);
  const isSelectedCountLimitExceedingMaxValue =
    selectedColumnsCount >= MAX_COLUMN_SELECTION;

  const handleTabClick = (key: string) => {
    setTab(key);
  };
  const handleColumnChange = (column: Column<T>) => (nextState: boolean) => {
    if (nextState === true && selectedColumnsCount >= MAX_COLUMN_SELECTION) {
      return;
    }

    column.toggleVisibility();
  };

  const shouldDisableUnselectedColumnOnMaxLimit = (column: Column<T>) =>
    isSelectedCountLimitExceedingMaxValue && !column.getIsVisible();

  return (
    <Dropdown
      content={
        <StyledMenu>
          <SegmentedControl
            fullWidth
            onButtonClicked={handleTabClick}
            currentKey={tab}
          >
            <StyledSegmentedButton key="All">All</StyledSegmentedButton>
            <StyledSegmentedButton key="Selected">
              Selected
              <StyledCountLabel size="small" variant="unknown">
                {selectedColumnsCount}
              </StyledCountLabel>
            </StyledSegmentedButton>
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

          {!isSearchResultEmpty && searchInput && (
            <SearchResultText>Results for "{searchInput}":</SearchResultText>
          )}

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
                      onChange={handleColumnChange(column)}
                      className="cogs-checkbox__checkbox"
                      disabled={
                        !column.getCanHide() ||
                        shouldDisableUnselectedColumnOnMaxLimit(column)
                      }
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

          {isSearchResultEmpty && (
            <EmptyStateContainer alignItems="center" justifyContent="center">
              <EmptyText>No options</EmptyText>
            </EmptyStateContainer>
          )}

          {!isSearchResultEmpty && isSelectedCountLimitExceedingMaxValue && (
            <Footer>
              <WarningInfobar>
                Due to performance reasons, the max amount of columns that can
                be selected is 20.{' '}
                <StyledResetSpan onClick={onResetSelectedColumns}>
                  Reset to default
                </StyledResetSpan>
              </WarningInfobar>
            </Footer>
          )}
        </StyledMenu>
      }
    >
      <Button icon="SplitView" aria-label="Column Selection" />
    </Dropdown>
  );
}

const StyledResetSpan = styled.span`
  text-decoration: underline;
  font-weight: 500;
  &:hover {
    cursor: pointer;
  }
`;

const StyledMenu = styled(Menu)`
  min-width: 256px;
  max-width: 256px;
  width: 100%;
  max-height: 456px;
  overflow: auto;

  .btn-reset {
    background: inherit !important;
  }
`;

const StyledHeader = styled(HighlightCell)`
  max-width: 170px;
  text-transform: capitalize;
  text-overflow: ellipsis;
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
  padding-top: 8px;
  padding-bottom: 8px;
`;

export const StyledCountLabel = styled(Label)`
  margin-left: 6px;
`;

export const Footer = styled(Menu.Footer)`
  position: sticky;
  bottom: -8px;
  background-color: white;
`;

const WarningInfobar = styled(Infobar).attrs({ type: 'warning' })`
  margin-bottom: 4px;
  border-radius: 6px;
  border: 1px solid rgba(255, 187, 0, 0.2);
`;

const SearchResultText = styled(Detail)`
  font-weight: 400 !important;
  color: var(--cogs-text-icon--muted) !important;
  padding: 8px;
`;

const StyledSegmentedButton = styled(SegmentedControl.Button)`
  width: 50% !important;
`;

const EmptyText = styled(Body).attrs({ level: 2, strong: true })`
  color: var(--cogs-text-icon--muted) !important;
`;

const EmptyStateContainer = styled(Flex)`
  padding: 16px;
`;
