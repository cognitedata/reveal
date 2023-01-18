import { Select, SelectProps } from '@cognite/cogs.js';
import { FilterTitle } from './FilterTitle';
// Note: use MultiSelectFilterNew filter from component libs. this is going to be removed in near future.
export const MultiSelectFilter = ({
  title,
  values,
  ...rest
}: SelectProps<any> & { title: string; values?: string[] }) => {
  return (
    <>
      <FilterTitle>{title}</FilterTitle>
      <Select
        data-testid="multi-select-filter"
        {...rest}
        onChange={(newValue: { value: string; label: string }[]) => {
          const tempValue = newValue?.map(({ value }) => value);
          rest.onChange(tempValue);
        }}
        value={values?.map((item) => ({
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
