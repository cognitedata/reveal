import { Input } from '@cognite/cogs.js';
import { FieldProps } from 'formik';

type Props = {
  title: string;
  placeholder: string;
};

export const InputField: React.FC<
  Props & FieldProps<string | number | undefined>
> = ({
  title,
  placeholder = '',
  field: { name, value },
  form: { errors, touched, handleChange, handleBlur },
}) => {
  return (
    <Input
      autoComplete="off"
      title={title}
      name={name}
      error={touched[name] && (errors[name] as string | undefined)}
      value={value || ''}
      variant="noBorder"
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      fullWidth
    />
  );
};
