import { HeaderProps, CellProps, Hooks, Row } from 'react-table';

import get from 'lodash/get';

import { Checkbox } from '@cognite/cogs.js';

export const SELECTION_COLUMN_ID = 'selection';

type SelectionHookProps = {
  handleRowSelect?: (row: CellProps<any>, nextState: boolean) => void;
  handleRowsSelect?: (nextState: boolean) => void;
  checkIfCheckboxEnabled?: (row: Row<any>) => boolean;
};
export const selectionHook =
  ({
    handleRowSelect,
    handleRowsSelect,
    checkIfCheckboxEnabled,
  }: SelectionHookProps) =>
  (hooks: Hooks<any>) => {
    hooks.visibleColumns.push((restOfColumns) => [
      // Let's make a column for selection
      {
        id: SELECTION_COLUMN_ID,
        disableResizing: true,
        minWidth: 30,
        width: '30px',
        maxWidth: 30,
        // The header can use the table's getToggleAllRowsSelectedProps method
        // to render a checkbox
        // @ts-expect-error unknown issue
        Header: ({ getToggleAllRowsSelectedProps, rows }: HeaderProps<any>) => {
          const selectedRowCount = rows.filter(
            (row: any) => row.isSelected
          ).length;
          const allSelected = selectedRowCount === rows.length;
          const {
            checked: _unused1,
            onChange: _unused2,
            ...rest
          } = getToggleAllRowsSelectedProps();
          const onCheckboxChanged = (nextState: boolean) => {
            if (handleRowsSelect) {
              handleRowsSelect(nextState);
            }
          };
          const isSelected = allSelected || false;
          const isIndeterminate = !allSelected && !!selectedRowCount;
          return (
            <Checkbox
              {...rest}
              checked={isSelected || isIndeterminate}
              indeterminate={isIndeterminate}
              onChange={onCheckboxChanged}
            />
          );
        },
        // The cell can use the individual row's getToggleRowSelectedProps method
        // to the render a checkbox
        Cell: ({ row }: CellProps<any>) => {
          const { checked, onChange: _unused3, ...rest } =
            // @ts-expect-error unknown issue
            row.getToggleRowSelectedProps();
          const isSelected = row.original.selected || checked || false;
          const onCheckboxChanged = (nextState: boolean) => {
            if (handleRowSelect) {
              handleRowSelect(row.original, nextState);
            }
          };
          const isCheckboxEnabled = checkIfCheckboxEnabled
            ? checkIfCheckboxEnabled(row)
            : true;

          return (
            <Checkbox
              {...rest}
              checked={isSelected}
              indeterminate={get(row, 'isIndeterminate', false)}
              onChange={onCheckboxChanged}
              disabled={!isCheckboxEnabled}
            />
          );
        },
      },
      ...restOfColumns,
    ]);
  };
