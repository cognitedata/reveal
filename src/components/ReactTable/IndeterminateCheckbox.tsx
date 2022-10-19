import { Checkbox } from '@cognite/cogs.js';
import React from 'react';
import {
  ColumnInstance,
  IdType,
  TableToggleHideAllColumnProps,
} from 'react-table';
import { mergeRefs } from 'utils';

export const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  TableToggleHideAllColumnProps & {
    setHiddenColumns: (param: IdType<Record<string, any>>[]) => void;
    allColumns: ColumnInstance<Record<string, any>>[];
    alwaysColumnVisible?: string;
  }
>(
  (
    {
      indeterminate,
      onChange = () => {},
      setHiddenColumns,
      allColumns,
      alwaysColumnVisible,
      checked,
    },
    ref
  ) => {
    const defaultRef = React.useRef<HTMLInputElement>();

    const handleCheckboxChange: React.ChangeEventHandler<
      HTMLInputElement
    > = evt => {
      const nextState = evt.target.checked;
      onChange(evt);
      if (!nextState) {
        setHiddenColumns(
          allColumns
            .map(col => col.id)
            .filter((id: string) => id !== (alwaysColumnVisible || 'name'))
        );
      }
    };

    React.useEffect(() => {
      if (defaultRef && defaultRef.current) {
        defaultRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [defaultRef, indeterminate]);

    return (
      <Checkbox
        name="Select all"
        checkboxRef={mergeRefs([defaultRef, ref]) as any}
        indeterminate={Boolean(indeterminate)}
        onChange={(_, evt) => handleCheckboxChange(evt)}
        checked={checked}
      />
    );
  }
);
