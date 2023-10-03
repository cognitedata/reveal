import React from 'react';

import styled from 'styled-components';

import { ICellRendererParams } from 'ag-grid-community';

import { Checkbox, Switch, Tooltip } from '@cognite/cogs.js';

type IsDisabledFunc = (field: any) => boolean;
export interface BoolCellRendererProps extends ICellRendererParams {
  displayControl?: 'switch' | 'checkbox';
  disabled?: boolean | IsDisabledFunc;
  disabledTooltip?: string;
}

export const BoolCellRenderer = React.memo((props: BoolCellRendererProps) => {
  const colId = props.column!.getColId();
  const rowIdx = props.rowIndex;

  // Leave it like this, component has react memo anyway
  const checkedHandler = (_: unknown, isChecked?: boolean | string) => {
    props.node.setDataValue(colId, isChecked);
  };

  const shouldRenderCheckbox = props.displayControl === 'checkbox';
  let shouldBeDisabled =
    // eslint-disable-next-line
    typeof props.disabled === 'function'
      ? props.disabled(props.data)
      : props.disabled === true;

  if (props.context.isCreatingNewField) {
    shouldBeDisabled = true;
  }

  return (
    <div
      style={{
        display: 'inline-block',
        paddingTop: '10px',
        textAlign: shouldRenderCheckbox ? 'center' : 'left',
        width: shouldRenderCheckbox ? '100%' : 'auto',
      }}
    >
      <Tooltip
        content={props.disabledTooltip || ''}
        disabled={!shouldBeDisabled || !props.disabledTooltip}
      >
        {shouldRenderCheckbox ? (
          <StyledCheckbox
            name={`${colId}_${rowIdx}`}
            checked={props.value}
            disabled={shouldBeDisabled}
            onChange={checkedHandler}
          />
        ) : (
          <Switch
            name={`${colId}_${rowIdx}`}
            checked={props.value}
            disabled={shouldBeDisabled}
            onChange={checkedHandler}
            size="x-small"
          ></Switch>
        )}
      </Tooltip>
    </div>
  );
});

const StyledCheckbox = styled(Checkbox)`
  .checkbox-ui.checkbox-ui {
    margin: 0;
  }
`;
