import React from 'react';

import { ICellRendererParams } from 'ag-grid-community';

import { Chip } from '@cognite/cogs.js';

import { NoNameDisplayName } from '../../../../constants';

export const DataModelNameCellRenderer = React.memo(
  (params: ICellRendererParams) => {
    const hasDraft = params.context.dataModelsWithDrafts.includes(
      params.data.id
    );

    const renderChip = () => {
      if (hasDraft) {
        return (
          <Chip
            size="small"
            style={{ marginLeft: '15px' }}
            type="default"
            label="Draft"
          />
        );
      }
      return (
        <Chip
          size="small"
          type="neutral"
          style={{ marginLeft: '15px' }}
          label={`V. ${params.data.version}`}
        />
      );
    };
    return (
      <span>
        {params.value || NoNameDisplayName}
        {params.data.version ? renderChip() : null}
      </span>
    );
  }
);
