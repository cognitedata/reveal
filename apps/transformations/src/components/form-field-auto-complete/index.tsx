import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '@transformations/components/form-field-wrapper';
import { AutoComplete, AutoCompleteProps } from 'antd';

type FormFieldAutoCompleteProps<V> = Omit<FormFieldWrapperProps, 'children'> &
  Pick<
    AutoCompleteProps,
    | 'allowClear'
    | 'children'
    | 'filterOption'
    | 'notFoundContent'
    | 'optionFilterProp'
    | 'options'
    | 'placeholder'
    | 'showSearch'
    | 'value'
  > & {
    error?: string;
    onChange: (value: V) => void;
  };

const FormFieldAutoComplete = <V,>({
  allowClear,
  children,
  error,
  filterOption,
  isRequired,
  notFoundContent,
  onChange,
  optionFilterProp,
  options,
  placeholder,
  showSearch,
  title,
  value,
}: FormFieldAutoCompleteProps<V>): JSX.Element => {
  return (
    <FormFieldWrapper isRequired={isRequired} title={title}>
      <AutoComplete<V>
        allowClear={allowClear}
        filterOption={filterOption}
        notFoundContent={notFoundContent}
        onChange={onChange}
        optionFilterProp={optionFilterProp}
        options={options}
        placeholder={placeholder}
        showSearch={showSearch}
        status={error && 'error'}
        style={{ width: '100%' }}
        value={value}
      >
        {children}
      </AutoComplete>
    </FormFieldWrapper>
  );
};

export default FormFieldAutoComplete;
