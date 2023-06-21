import React from 'react';

import { SelectableTableCellRenderer } from '@vision/modules/Common/types';

import { Checkbox } from '@cognite/cogs.js';

export function SelectionRenderer(props: SelectableTableCellRenderer) {
  const { onChange, selectedIds } = props.column;
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
        name={`check-${props.rowData.rowKey}`}
        checked={selectedIds?.includes(props.rowData.id)}
        onChange={(_event, next) =>
          onChange({
            selected: next,
            rowData: props.rowData,
            rowIndex: props.rowIndex,
          })
        }
      />
    </div>
  );
}
