import { ChangeEventHandler } from 'react';

import { Input, InputProps } from 'antd';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from 'components/form-field-wrapper';

type FormFieldInputProps = Omit<FormFieldWrapperProps, 'children'> &
  Pick<InputProps, 'name' | 'onBlur' | 'placeholder' | 'value' | 'disabled'> & {
    error?: string;
    onChange: (value: string) => void;
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
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
    onChange(e.target.value);
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
