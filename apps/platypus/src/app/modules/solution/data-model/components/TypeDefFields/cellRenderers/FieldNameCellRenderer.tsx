import React from 'react';

import { ICellRendererParams } from 'ag-grid-community';

import { Flex, Icon } from '@cognite/cogs.js';

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

    const isDisabled =
      props.disabled ||
      (props.colDef?.field === 'type' && props.context.isCreatingNewField);

    const showDropDownArrow = props.showDropDownArrow === true;

    return (
      <div
        className={`field-input ${isDisabled ? 'disabled' : ''}`}
        data-cy="schema-type-field"
        data-cy-value={fieldName}
      >
        <Flex
          className="input-value"
          alignItems="center"
          justifyContent="space-between"
          style={{ display: 'flex' }}
        >
          <span>{fieldName}</span>{' '}
          {showDropDownArrow && <Icon type="ChevronDown" />}
        </Flex>
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
