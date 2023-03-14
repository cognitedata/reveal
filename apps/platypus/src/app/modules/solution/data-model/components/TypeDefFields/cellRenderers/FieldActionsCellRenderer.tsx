import { DataModelTypeDefsField } from '@platypus/platypus-core';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import { DeleteFieldButton } from '../elements';

export interface FieldActionsCellRendererProps extends ICellRendererParams {
  disabled: boolean;
  onClick?: (rowData: DataModelTypeDefsField) => void;
}

export const FieldActionsCellRenderer = React.memo(
  (props: FieldActionsCellRendererProps) => {
    // we don't want to render this button in case if it is disabled
    if (props.disabled) {
      return null;
    }
    if (props.data.name !== '' && props.context.isCreatingNewField) {
      return null;
    }

    return (
      <DeleteFieldButton
        icon="Delete"
        aria-label="Delete field"
        type="ghost"
        data-cy="delete-field-btn"
        style={{ paddingLeft: 0, paddingRight: 0, width: '34px' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (props.onClick) {
            props.onClick(props.data as DataModelTypeDefsField);
          }
        }}
      />
    );
  }
);
