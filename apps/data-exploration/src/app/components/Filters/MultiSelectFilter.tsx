import { Select, SelectProps } from '@cognite/cogs.js';
import { FilterTitle } from './FilterTitle';

export const MultiSelectFilter = ({
  title,
  values,
  ...rest
}: SelectProps<any> & { title: string; values?: string[] }) => {
  return (
    <>
      <FilterTitle>{title}</FilterTitle>
      <Select
        {...rest}
        onChange={(newValue: { value: string; label: string }[]) => {
          const values = newValue?.map(({ value }) => value);
          rest.onChange(values);
        }}
        value={values?.map(item => ({
          label: item,
          value: item,
        }))}
        isMulti
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
      />
    </>
  );
};
