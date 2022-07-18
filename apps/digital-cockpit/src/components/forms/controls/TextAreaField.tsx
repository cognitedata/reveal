import { Micro } from '@cognite/cogs.js';
import {
  Textarea,
  ValidationContainer,
  CustomLabel,
} from 'components/forms/elements';
import { FieldProps } from 'formik';

type Props = {
  title: string;
  placeholder: string;
  maxLength: number;
};

export const TextAreaField: React.FC<
  Props & FieldProps<string | undefined>
> = ({
  title,
  placeholder,
  maxLength,
  field: { name, value = '' },
  form: { errors, handleChange, handleBlur },
}) => {
  const warningLength = maxLength - 50;
  const exceedMaxLength = value.length >= maxLength;
  const exceedWarningLength = value.length >= warningLength;
  return (
    <>
      <CustomLabel>{title}</CustomLabel>
      <Textarea
        autoComplete="off"
        className={errors[name] && 'has-error'}
        title={title}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
      />
      <ValidationContainer exceedWarningLength={exceedMaxLength}>
        {errors?.description && (
          <span className="error-space">{errors?.description as any}</span>
        )}
        {exceedWarningLength && (
          <Micro>
            {value.length}/{maxLength}
          </Micro>
        )}
      </ValidationContainer>
    </>
  );
};
