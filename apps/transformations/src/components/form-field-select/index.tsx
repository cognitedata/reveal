import { useState } from 'react';

import styled from 'styled-components';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '@transformations/components/form-field-wrapper';
import { Select, SelectProps } from 'antd';

import { Icon } from '@cognite/cogs.js';

type FormFieldSelectProps<V> = Omit<FormFieldWrapperProps, 'children'> &
  Pick<
    SelectProps,
    | 'allowClear'
    | 'children'
    | 'filterOption'
    | 'loading'
    | 'notFoundContent'
    | 'optionFilterProp'
    | 'optionLabelProp'
    | 'options'
    | 'placeholder'
    | 'showSearch'
    | 'value'
    | 'disabled'
  > & {
    allowNewItem?: boolean;
    error?: string;
    onChange: (value: V) => void;
  };

const FormFieldSelect = <V,>({
  allowClear,
  allowNewItem,
  children,
  error,
  filterOption,
  isRequired,
  loading,
  notFoundContent,
  onChange,
  optionFilterProp,
  optionLabelProp,
  options,
  placeholder,
  showSearch,
  title,
  value,
  disabled,
  infoTooltip,
}: FormFieldSelectProps<V>): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>();

  const handleSearch = (query: string): void => {
    setSearchValue(query);
  };

  return (
    <FormFieldWrapper
      isRequired={isRequired}
      title={title}
      infoTooltip={infoTooltip}
    >
      <Select<V>
        disabled={disabled}
        allowClear={allowClear}
        filterOption={filterOption}
        loading={loading}
        notFoundContent={notFoundContent}
        onChange={onChange}
        onSearch={allowNewItem ? handleSearch : undefined}
        optionFilterProp={optionFilterProp}
        optionLabelProp={optionLabelProp}
        options={
          searchValue
            ? options?.concat({ label: searchValue, value: searchValue })
            : options
        }
        placeholder={placeholder}
        showSearch={showSearch}
        suffixIcon={<Icon type="ChevronDown" />}
        clearIcon={<StyledClearIcon size={16} type="ClearAll" />}
        status={error && 'error'}
        style={{ width: '100%' }}
        value={value}
      >
        {children}
        {searchValue && (
          <Select.Option label={searchValue} value={searchValue}>
            {searchValue}
          </Select.Option>
        )}
      </Select>
    </FormFieldWrapper>
  );
};

const StyledClearIcon = styled(Icon)`
  margin-top: -2px;
  margin-left: -4px;
`;

export default FormFieldSelect;
