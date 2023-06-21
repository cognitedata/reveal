import { SelectableTableCellRenderer } from 'src/modules/Common/types';
import React from 'react';
import { Button, Checkbox, Dropdown, Menu } from '@cognite/cogs.js';
import { keyGenerator } from 'src/utils/keyGenerator/keyGenerator';

export function SelectAllHeaderRenderer({
  column,
}: SelectableTableCellRenderer) {
  const {
    fileIdsInCurrentPage,
    fetchedCount,
    allSelected,
    onSelectPage,
    selectedIds,
    onSelectAll,
  } = column;
  const handleSelectAllFiles = () => {
    if (onSelectAll) {
      onSelectAll(!allSelected);
    }
  };
  const columnHeaderUniqueKeyGenerator = keyGenerator({
    prefix: 'column-header-key',
  });
  const columnHeaderKey = columnHeaderUniqueKeyGenerator.next().value as string;
  const pageSelected: boolean = fileIdsInCurrentPage.every((val: any) =>
    selectedIds?.includes(val)
  );
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item
        onClick={() => {
          if (onSelectPage && fileIdsInCurrentPage) {
            if (pageSelected) onSelectPage([]);
            else onSelectPage(fileIdsInCurrentPage);
          }
        }}
      >
        Select all in page [{fileIdsInCurrentPage.length}]
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          if (column.onSelectAll) {
            column.onSelectAll(!column.allSelected);
          }
        }}
      >
        Select all [{fetchedCount}]
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Checkbox
        name={columnHeaderKey}
        checked={column.allSelected}
        onChange={handleSelectAllFiles}
      />
      <Dropdown content={MenuContent}>
        <Button
          type="ghost"
          icon="ChevronDownSmall"
          aria-label="dropdown button"
        />
      </Dropdown>
    </>
  );
}
