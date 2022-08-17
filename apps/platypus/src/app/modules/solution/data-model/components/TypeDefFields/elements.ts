import { Button } from '@cognite/cogs.js';
import { ZIndex } from '@platypus-app/utils/zIndex';
import styled from 'styled-components';

export const DataModelFieldsGrid = styled.div`
  padding: 0 16px;
  display: block;
  width: 100%;
  overflow: visible;

  .ag-root-wrapper {
    overflow: visible;
  }

  .ag-popup-editor {
    z-index: ${ZIndex.Popup};
  }

  .ag-header-cell.col-txt-center .ag-header-cell-label {
    justify-content: center;
  }

  .ag-cell.ag-cell-focus.ag-cell-inline-editing[col-id='type'] {
    overflow: visible;
  }

  .field-input {
    --cogs-input-default-height: 36px;
    --cogs-input-line-height: 32px;

    display: block;
    height: var(--cogs-input-default-height);
    line-height: var(--cogs-input-line-height);

    box-sizing: border-box;
    padding: 0 10px;
    border: var(--cogs-input-border);
    border-radius: var(--cogs-border-radius--default);
    caret-color: var(--cogs-color-black);
    outline: none;
    color: var(--cogs-greyscale-grey10);
    font-size: var(--cogs-font-size-sm);
    font-style: normal;
    font-weight: 400;
    position: relative;

    > .input-value,
    > input {
      background: transparent;
      outline: 0;
      border: 0;
      padding: 0;
      margin: 0;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.disabled {
      background: var(--cogs-surface--medium, #fafafa);
      border: 2px solid var(--cogs-greyscale-grey3, #e8e8e8);
      cursor: not-allowed;
    }
  }

  .ag-cell[col-id='name'] .field-input {
    margin-right: 8px;
  }

  .field-input:hover,
  .ag-cell.ag-cell-focus .field-input {
    border-color: var(--cogs-midblue-4);
  }

  .field-input.has-error:hover,
  .ag-cell .field-input.has-error {
    border-color: var(--cogs-danger);
  }
`;

export const DeleteFieldButton = styled(Button)`
  outline: 0;
  border: 1px solid transparent;

  &:focus-visible,
  &:active {
    box-shadow: none;
    outline: 0;
    border: 1px solid var(--cogs-border--interactive--toggled-default);
  }
`;

export const FieldNameInput = styled.div`
  --cogs-input-default-height: 36px;
  --cogs-input-line-height: 36px;

  display: block;
  height: var(--cogs-input-default-height);
  box-sizing: border-box;
  padding: 0 12px;
  border: var(--cogs-input-border);
  border-radius: var(--cogs-border-radius--default);
  caret-color: var(--cogs-color-black);
  outline: none;
  color: var(--cogs-greyscale-grey10);
  font-size: var(--cogs-font-size-sm);
  font-style: normal;
  font-weight: 400;
  line-height: var(--cogs-input-line-height);
  margin-right: 8px;

  > .input-value,
  > input {
    background: transparent;
    outline: 0;
    border: 0;
    padding: 0;
    margin: 0;
    display: inline-block;
    height: 34px;
    line-height: 34px;
  }

  &.has-error {
    border-color: var(--cogs-danger);
  }
`;
