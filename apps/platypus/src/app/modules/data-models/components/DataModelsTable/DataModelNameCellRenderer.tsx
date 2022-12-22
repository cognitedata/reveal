import { Label } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

export const DataModelNameCellRenderer = React.memo(
  (params: ICellRendererParams) => {
    const hasDraft = params.context.dataModelsWithDrafts.includes(
      params.data.id
    );

    const renderLabel = () => {
      if (hasDraft) {
        return (
          <Label size="small" variant="unknown" style={{ marginLeft: '15px' }}>
            Draft
          </Label>
        );
      }
      return (
        <Label size="small" style={{ marginLeft: '15px' }}>
          V. {params.data.version}
        </Label>
      );
    };
    return (
      <span>
        {params.value}
        {params.data.version ? renderLabel() : null}
      </span>
    );
  }
);
