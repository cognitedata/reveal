import { Select, SelectProps } from '@cognite/cogs.js';
import { FilterTitleNew } from './FilterTitleNew';

export const MultiSelectFilterNew = ({
  title,
  values,
  ...rest
}: SelectProps<any> & { title: string; values?: string[] }) => {
  return (
    <>
      <FilterTitleNew>{title}</FilterTitleNew>
      <Select
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
