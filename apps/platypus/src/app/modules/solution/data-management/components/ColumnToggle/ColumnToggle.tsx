import React, { useState, Suspense, useMemo, useEffect } from 'react';

import styled from 'styled-components';

import {
  DragDropContainer,
  DragHandleIcon,
  WithDragHandleProps,
} from '@data-exploration/components';

import {
  Button,
  Checkbox,
  Dropdown,
  Flex,
  Input,
  Menu,
  Chip,
  SegmentedControl,
  Detail,
  Body,
} from '@cognite/cogs.js';

import { useMixpanel } from '../../../../../hooks/useMixpanel';
import { useTranslation } from '../../../../../hooks/useTranslation';

export type ColumnToggleType = {
  label: string;
  value: string;
  visible?: boolean;
  disabled?: boolean;
};

export interface ColumnToggleProps {
  allColumns: ColumnToggleType[];
  onChange: (value: ColumnToggleType[]) => void;
  columnSelectionLimit?: number;
}

const style = {
  backgroundColor: 'white',
};

//Modified the example from here https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
export const MenutItemDrag: React.FC<
  React.PropsWithChildren<WithDragHandleProps<{ isDragEnabled?: boolean }>>
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

export const ColumnToggle = ({
  allColumns: initialColumns,
  onChange,
  columnSelectionLimit = Infinity,
}: ColumnToggleProps) => {
  const { t } = useTranslation('ColumnToggle');
  const { track } = useMixpanel();
  const [searchInput, setSearchInput] = useState('');
  const [tab, setTab] = useState('All');

  const [allColumns, setColumns] = useState(initialColumns);
  const [elementOrders, setOrder] = useState(
    initialColumns.map((column) => column.value)
  );
  useEffect(() => {
    setColumns(initialColumns);
    setOrder(initialColumns.map((column) => column.value));
  }, [initialColumns]);

  const handleTabClick = (key: string) => {
    setTab(key);
  };

  const sortedColumns = allColumns.sort((a, b) => {
    const aIndex = elementOrders.indexOf(a.value);
    const bIndex = elementOrders.indexOf(b.value);
    return aIndex - bIndex;
  });

  const filteredColumns = sortedColumns.filter((column) =>
    column.label.toLowerCase().includes(searchInput.toLowerCase())
  );
  const isSearchResultEmpty = filteredColumns.length === 0;

  const selectedColumns = filteredColumns.filter((column) => column.visible);

  const selectedTabColumns = useMemo(() => {
    return tab === 'All' ? filteredColumns : selectedColumns;
  }, [tab, filteredColumns, selectedColumns]);

  const selectedColumnsCount = allColumns.reduce((accumulator, item) => {
    return item.visible ? accumulator + 1 : accumulator;
  }, 0);
  const isSelectedCountLimitExceedingMaxValue =
    selectedColumnsCount >= columnSelectionLimit;

  const handleColumnChange = (column: ColumnToggleType) => {
    track('ColumnSelection.Select');
    if (!column.visible && selectedColumnsCount >= columnSelectionLimit) {
      return;
    }

    setColumns((columns) =>
      columns.map((el) => {
        if (el.value === column.value) {
          return {
            ...el,
            visible: !el.visible,
          };
        }
        return el;
      })
    );
  };

  const isSelectedItemsEmpty = tab === 'Selected' && selectedColumnsCount === 0;

  const shouldDisableUnselectedColumnOnMaxLimit = (
    column: (typeof allColumns)[0]
  ) => isSelectedCountLimitExceedingMaxValue && !column.visible;

  return (
    <Dropdown
      appendTo="parent"
      onShown={() => {
        track('ColumnSelection.Open');
      }}
      onHide={() => {
        onChange(sortedColumns);
      }}
      content={
        <Suspense fallback="...loading">
          <StyledMenu data-cy="column-select-dropdown">
            <SegmentedControl
              fullWidth
              onButtonClicked={handleTabClick}
              currentKey={tab}
            >
              <StyledSegmentedButton key="All" data-cy="all-columns">
                {t('column-selection-all', 'All')}
              </StyledSegmentedButton>
              <StyledSegmentedButton
                key="Selected"
                data-cy="selected-columns-only"
              >
                {t('column-selection-selected', 'Selected')}
                <StyledCountLabel
                  size="small"
                  label={String(selectedColumnsCount)}
                />
              </StyledSegmentedButton>
            </SegmentedControl>

            <StyledInput
              type="search"
              clearable={{ callback: () => setSearchInput('') }}
              placeholder={t(
                'column-selection-filter-placeholder',
                'Filter by field'
              )}
              fullWidth
              variant="noBorder"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {!isSearchResultEmpty && searchInput && (
              <SearchResultText>Results for "{searchInput}":</SearchResultText>
            )}

            {tab === 'All' && (
              <Flex gap={6}>
                <Button
                  size="small"
                  data-cy="select-all"
                  key="select-all"
                  onClick={() => {
                    track('ColumnSelection.SelectAll');
                    setColumns((columns) =>
                      columns.map((el) => {
                        return { ...el, visible: true };
                      })
                    );
                  }}
                >
                  {t('column-selection-select-all', 'Select all')}
                </Button>
                <Button
                  size="small"
                  data-cy="deselect-all"
                  key="deselect-all"
                  onClick={() => {
                    track('ColumnSelection.SelectAll', { deselect: true });
                    setColumns((columns) =>
                      columns.map((el) => {
                        return { ...el, visible: false };
                      })
                    );
                  }}
                >
                  {t('column-selection-deselect-all', 'Deselect all')}
                </Button>
              </Flex>
            )}

            <MenuItemsWrapper>
              <DragDropContainer
                direction="vertical"
                id="column-toggle"
                elementsOrder={elementOrders}
                onDragEnd={(sorted) => {
                  setOrder(sorted);
                  track('ColumnSelection.Reorder');
                }}
                isCustomPortal
              >
                {selectedTabColumns.map((column) => {
                  return (
                    <MenutItemDrag
                      key={column.value}
                      isDragEnabled={!searchInput}
                    >
                      <StyledLabel>
                        <Checkbox
                          name={column.value}
                          checked={column.visible}
                          onChange={() => handleColumnChange(column)}
                          className="cogs-checkbox__checkbox"
                          disabled={
                            column.disabled ||
                            shouldDisableUnselectedColumnOnMaxLimit(column)
                          }
                        />
                        <Flex direction="column">
                          <Body>{column.label}</Body>
                        </Flex>
                      </StyledLabel>
                    </MenutItemDrag>
                  );
                })}
              </DragDropContainer>
            </MenuItemsWrapper>

            {(isSelectedItemsEmpty || isSearchResultEmpty) && (
              <EmptyStateContainer alignItems="center" justifyContent="center">
                <EmptyText>
                  {t('column-selection-empty', 'No options')}
                </EmptyText>
              </EmptyStateContainer>
            )}
          </StyledMenu>
        </Suspense>
      }
    >
      <Button
        icon="SplitView"
        aria-label="Column Selection"
        data-cy="column-select"
      >
        Columns
      </Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  min-width: 256px;
  max-width: 256px;
  width: 100%;
  max-height: 456px;
  overflow: hidden;

  .btn-reset {
    background: inherit !important;
  }
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
const StyledInput = styled(Input)`
  padding-top: 8px;
  padding-bottom: 8px;
`;

const StyledCountLabel = styled(Chip)`
  margin-left: 6px;
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

const MenuItemsWrapper = styled.div`
  height: 100%;
  overflow: auto;
`;

export const MetadataHeaderText = styled(Detail)`
  font-weight: 400 !important;
  color: var(--cogs-text-icon--muted) !important;
`;
