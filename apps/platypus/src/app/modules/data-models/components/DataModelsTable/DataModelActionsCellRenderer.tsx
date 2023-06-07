import React from 'react';

import { ICellRendererParams } from 'ag-grid-community';

import { Button } from '@cognite/cogs.js';

export const DataModelActionsCellRenderer = React.memo(
  (params: ICellRendererParams) => {
    return (
      <Button
        // https://stackoverflow.com/questions/63964553/ag-grid-prevent-onrowclicked-event-when-clicking-icon-inside-cell
        ref={(ref) => {
          if (!ref) return;

          ref.onclick = (e) => {
            params.context.onDelete(params.data);
            e.stopPropagation();
          };
        }}
        className="delete-button"
        type="ghost-destructive"
        size="small"
        icon="Delete"
      />
    );
  }
);
