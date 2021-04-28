import { CellRenderer } from 'src/modules/Common/Types';
import React from 'react';

export function SelectionRenderer({ rowData, column, rowIndex }: CellRenderer) {
  const { selectedRowKeys, rowKey } = column;
  const checked = selectedRowKeys.includes(rowData[rowKey]);

  const handleChange = (e) => {
    const { onChange } = column;

    onChange({ selected: e.target.checked, rowData, rowIndex });
  };
  return <input type="checkbox" checked={checked} onChange={handleChange} />;
}
