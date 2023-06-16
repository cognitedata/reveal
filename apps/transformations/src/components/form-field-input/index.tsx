import { ChangeEventHandler } from 'react';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '@transformations/components/form-field-wrapper';
import { Input, InputProps } from 'antd';

type FormFieldInputProps = Omit<FormFieldWrapperProps, 'children'> &
  Pick<InputProps, 'name' | 'onBlur' | 'placeholder' | 'value'> & {
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
      />
    </FormFieldWrapper>
  );
};

export default FormFieldInput;
