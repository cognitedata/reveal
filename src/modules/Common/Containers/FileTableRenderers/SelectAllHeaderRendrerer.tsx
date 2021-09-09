import { SelectableTableCellRenderer } from 'src/modules/Common/types';
import React from 'react';
import { Button, Checkbox, Dropdown, Menu } from '@cognite/cogs.js';

export function SelectAllHeaderRenderer({
  column,
}: SelectableTableCellRenderer) {
  const {
    fileIdsInCurrentPage,
    fetchedCount,
    allSelected,
    onSelectPage,
    selectedRowIds,
    onSelectAll,
  } = column;
  const handleSelectAllFiles = () => {
    if (onSelectAll) {
      onSelectAll(!allSelected);
    }
  };
  const pageSelected: boolean = fileIdsInCurrentPage.every((val: any) =>
    selectedRowIds.includes(val)
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
    <Checkbox
      className="cogs-body-2"
      name="select-all-files"
      checked={column.allSelected}
      onChange={handleSelectAllFiles}
      style={{ margin: 0 }}
    >
      <Dropdown content={MenuContent}>
        <Button
          type="ghost"
          icon="ChevronDownCompact"
          aria-label="dropdown button"
        />
      </Dropdown>
    </Checkbox>
  );
}
