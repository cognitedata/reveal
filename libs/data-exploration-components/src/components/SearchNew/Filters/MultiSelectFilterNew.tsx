import * as React from 'react';
import { OptionType, Select, SelectProps } from '@cognite/cogs.js';
import { FilterTitleNew } from './FilterTitleNew';
import { NIL_FILTER_OPTION } from '@data-exploration-components/components/Select/BaseSelect';
import isString from 'lodash/isString';

export const MultiSelectFilterNew = <T,>({
  title,
  values,
  addNilOption = false,
  options: optionsOriginal,
  ...rest
}: SelectProps<any> & {
  title: string;
  values?: string[] | OptionType<T>[];
}) => {
  const options = React.useMemo(() => {
    if (!addNilOption) {
      return optionsOriginal;
    }
    return [...optionsOriginal, NIL_FILTER_OPTION];
  }, [optionsOriginal, addNilOption]);
  return (
    <>
      <FilterTitleNew>{title}</FilterTitleNew>
      <Select
        {...rest}
        onChange={(newValue: { value: string; label: string }[]) => {
          const tempValue = newValue?.map(({ value }) => value);
          rest.onChange(tempValue, newValue);
        }}
        options={options}
        value={values?.map((item) => {
          if (isString(item)) {
            return { label: item, value: item };
          }
          return item;
        })}
        isMulti
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
      />
    </>
  );
};
