import { Tag, Tooltip } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

export const CustomCellRenderer = React.memo((props: ICellRendererParams) => {
  if (!props.value) {
    return null;
  }

  const tag = <Tag>{props.value}</Tag>;

  if (props.data === undefined || props.colDef?.field === undefined) {
    return <div>{tag}</div>;
  }

  const fieldValues = Object.entries(props.data[props.colDef.field])
    .filter(([name]) => name !== 'externalId')
    .map(([name, value], i) => <div key={i}>{`${name}: ${value}`}</div>);

  return (
    <div>
      <Tooltip content={<>{fieldValues}</>}>{tag}</Tooltip>
    </div>
  );
});
