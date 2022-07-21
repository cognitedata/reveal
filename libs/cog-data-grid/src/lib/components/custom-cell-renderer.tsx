import { Tag } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

export const CustomCellRenderer = React.memo((props: ICellRendererParams) => {
  if (!props.value) {
    return null;
  }

  return (
    <div>
      <Tag>
        {props.value.externalId ||
          props.value._externalId ||
          JSON.stringify(props.value)}
      </Tag>
    </div>
  );
});
