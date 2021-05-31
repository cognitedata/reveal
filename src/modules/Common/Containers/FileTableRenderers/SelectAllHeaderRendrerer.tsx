import { SelectableTableCellRenderer } from 'src/modules/Common/types';
import React from 'react';
import { Checkbox } from '@cognite/cogs.js';

export function SelectAllHeaderRenderer({
  column,
}: SelectableTableCellRenderer) {
  const handleSelectAllFiles = () => {
    if (column.onSelectAll) {
      column.onSelectAll(!column.allSelected);
    }
  };
  return (
    <Checkbox
      className="cogs-body-2"
      name="select-all-files"
      value={column.allSelected}
      onChange={handleSelectAllFiles}
      style={{
        color: '#595959',
        fontSize: 10,
        fontWeight: 'normal',
        fontStyle: 'normal',
      }}
    >
      {column.title}
    </Checkbox>
  );
}
