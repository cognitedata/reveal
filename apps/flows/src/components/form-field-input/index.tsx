import { ChangeEvent, ChangeEventHandler } from 'react';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '@flows/components/form-field-wrapper';
import { Input, InputProps } from 'antd';

type FormFieldInputProps = Omit<FormFieldWrapperProps, 'children'> &
  Pick<InputProps, 'name' | 'onBlur' | 'placeholder' | 'value' | 'disabled'> & {
    error?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    type?: string;
  };

const FormFieldInput = ({
  error,
  isRequired,
  name,
  onBlur,
  onChange,
  placeholder,
  title,
  value,
  type,
  disabled,
}: FormFieldInputProps): JSX.Element => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };
  return (
    <FormFieldWrapper error={error} isRequired={isRequired} title={title}>
      <Input
        status={error && 'error'}
        name={name}
        onBlur={onBlur}
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
        type={type}
        disabled={disabled}
      />
    </FormFieldWrapper>
  );
};

export default FormFieldInput;
