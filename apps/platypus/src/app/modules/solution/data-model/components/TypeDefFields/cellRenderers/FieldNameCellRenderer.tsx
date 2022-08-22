import { Icon } from '@cognite/cogs.js';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';

interface FieldNameCellRendererProps extends ICellRendererParams {
  disabled: boolean;
  showDropDownArrow?: boolean;
}

export const FieldNameCellRenderer = React.memo(
  (props: FieldNameCellRendererProps) => {
    let fieldName = props.value;

    if (props.colDef?.field === 'type' && props.data.type.list) {
      fieldName = `[${fieldName}] list`;
    }
    const showDropDownArrow = props.showDropDownArrow === true;
    return (
      <div
        className={`field-input ${props.disabled ? 'disabled' : ''}`}
        data-cy="schema-type-field"
        data-cy-value={fieldName}
      >
        <span className="input-value">
          {fieldName}{' '}
          {showDropDownArrow && (
            <Icon
              type="ChevronDown"
              style={{
                color: 'var(--cogs-greyscale-grey6)',
                float: 'right',
                marginTop: '8px',
              }}
            />
          )}
        </span>
      </div>
    );
  },
  (prev, next) => {
    if (prev.colDef?.field === 'type') {
      return (
        prev.data.type.name === next.data.type.name &&
        prev.data.type.list === next.data.type.list
      );
    }

    return prev.data.name === next.data.name;
  }
);
