import { CellRenderer } from 'src/modules/Common/types';
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
  const handleClick = (evt: any) => {
    // dummy handler to stop event propagation
    evt.stopPropagation();
  };
  return (
    <Checkbox
      onClick={handleClick}
      name={`check-${props.rowIndex}`}
      value={props.rowData.selected}
      onChange={handleChange}
    />
  );
}
