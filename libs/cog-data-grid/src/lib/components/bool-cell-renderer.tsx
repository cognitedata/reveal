import { Switch } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React, { useCallback } from 'react';

export const BoolCellRenderer = React.memo((props: ICellRendererParams) => {
  const colId = props.column!.getColId();
  const rowIdx = props.rowIndex;

  const checkedHandler = useCallback(
    (isChecked: boolean) => {
      props.node.setDataValue(colId, isChecked);
    },
    [colId, props.node]
  );

  return (
    <div
      style={{
        display: 'inline-block',
        paddingTop: '4px',
      }}
    >
      <Switch
        name={`${colId}_${rowIdx}`}
        checked={props.value}
        onChange={checkedHandler}
        size="small"
      ></Switch>
    </div>
  );
});
