import { OptionType, Select, SelectProps } from '@cognite/cogs.js';
import isString from 'lodash/isString';
import { FilterTitleNew } from './FilterTitleNew';

export const MultiSelectFilterNew = <T,>({
  title,
  values,
  ...rest
}: SelectProps<any> & {
  title: string;
  values?: string[] | OptionType<T>[];
}) => {
  return (
    <>
      <FilterTitleNew>{title}</FilterTitleNew>
      <Select
        {...rest}
        onChange={(newValue: { value: string; label: string }[]) => {
          const tempValue = newValue?.map(({ value }) => value);
          rest.onChange(tempValue, newValue);
        }}
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
