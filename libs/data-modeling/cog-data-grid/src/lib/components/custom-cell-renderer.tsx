import React from 'react';

import { ICellRendererParams } from 'ag-grid-community';

import { Chip } from '@cognite/cogs.js';

export const CustomCellRenderer = React.memo((props: ICellRendererParams) => {
  if (!props.value.externalId) {
    return null;
  }

  return (
    <div>
      <Chip label={props.value.externalId} />
    </div>
  );
});
