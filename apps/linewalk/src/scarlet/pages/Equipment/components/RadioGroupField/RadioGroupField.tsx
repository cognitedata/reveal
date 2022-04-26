import { Radio } from '@cognite/cogs.js';
import { Field, FieldProps } from 'formik';

import { DataSourceFieldProps, StringField } from '..';

import * as Styled from './style';

interface RadioGroupFieldProps extends DataSourceFieldProps {
  options: Record<string, string>;
}

export const RadioGroupField = ({
  id,
  name,
  label,
  disabled,
  options,
}: RadioGroupFieldProps) => {
  const validate = (value: string) => !(value in options);
  return (
    <Field name={name} validate={validate}>
      {({ form, field }: FieldProps<string>) =>
        disabled ? (
          <StringField
            id={id}
            name={name}
            label={label}
            printedValue={options[field.value.trim()] ?? field.value}
            disabled
          />
        ) : (
          <>
            <Styled.Label className="cogs-detail">{label}</Styled.Label>
            <Styled.RadioGroupContainer>
              {Object.keys(options).map((key) => (
                <Styled.RadioContainer key={key}>
                  <Radio
                    id={field.value === key ? id : id + key}
                    disabled={disabled}
                    value={key}
                    checked={field.value === key}
                    onChange={() => form.setFieldValue(name, key)}
                  >
                    {options[key]}
                  </Radio>
                </Styled.RadioContainer>
              ))}
            </Styled.RadioGroupContainer>
          </>
        )
      }
    </Field>
  );
};
