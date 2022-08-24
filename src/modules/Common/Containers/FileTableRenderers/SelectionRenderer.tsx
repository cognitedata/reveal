import { SelectableTableCellRenderer } from 'src/modules/Common/types';
import React from 'react';
import { Checkbox } from '@cognite/cogs.js';

export function SelectionRenderer(props: SelectableTableCellRenderer) {
  const { onChange, selectedIds } = props.column;
  const handleChange = (change: boolean) => {
    onChange({
      selected: change,
      rowData: props.rowData,
      rowIndex: props.rowIndex,
    });
  };
  const handleClick = (evt: any) => {
    // dummy handler to stop event propagation
    evt.stopPropagation();
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      <Checkbox
        // onClick={handleClick}
        name={`check-${props.rowData.rowKey}`}
        checked={selectedIds?.includes(props.rowData.id)}
        onChange={handleChange}
      />
    </div>
  );
}
