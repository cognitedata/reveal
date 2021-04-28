import { CellRenderer } from 'src/modules/Common/Types';
import React from 'react';
import { Checkbox } from '@cognite/cogs.js';

export function SelectionRenderer(props: CellRenderer) {
  const { onChange } = props.column;
  const handleChange = (change: boolean) => {
    onChange({
      selected: change,
      rowData: props.rowData,
      rowIndex: props.rowIndex,
    });
  };
  return (
    <Checkbox
      name={`check-${props.rowIndex}`}
      value={props.rowData.selected}
      onChange={handleChange}
    />
  );
}
