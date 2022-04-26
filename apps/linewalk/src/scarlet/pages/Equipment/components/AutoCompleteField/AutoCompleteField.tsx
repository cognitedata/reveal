import { useMemo, useState } from 'react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { AutoComplete } from '@cognite/cogs.js';

import { DataSourceFormValues, DataSourceFieldProps } from '..';
import { StringField } from '../StringField';

export const AutoCompleteField = ({
  id,
  label,
  name,
  unit,
  values,
  disabled,
}: DataSourceFieldProps) => {
  const {
    setFieldValue,
    values: { value: currentValue },
  } = useFormikContext<DataSourceFormValues>();
  const initialOptions = useMemo(() => {
    const allValues = values;

    if (currentValue && !values?.includes(currentValue)) {
      allValues?.push(currentValue);
    }

    return allValues?.sort().map((value) => ({ value, label: value })) || [];
  }, []);

  const [options, setOptions] = useState(initialOptions);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === currentValue),
    [currentValue]
  );

  const onChange = (option: { value: string }) => {
    setFieldValue(name, option.value);
  };

  const onCreateOption = (value: string) => {
    setOptions((options) => {
      return [...options, { value, label: value }].sort((a, b) =>
        a.value < b.value ? -1 : 1
      );
    });
    setFieldValue(name, value);
  };

  return (
    <Field
      name={name}
      validate={(value: string) => (!value?.trim() ? 'Empty' : undefined)}
    >
      {({ field }: FieldProps<string>) =>
        disabled ? (
          <StringField
            id={id}
            name={name}
            label={label}
            printedValue={field.value}
            disabled
          />
        ) : (
          <AutoComplete
            id={id}
            options={options}
            title={label}
            variant="titleAsPlaceholder"
            fullWidth
            style={{ height: '48px', borderWidth: '1px' }}
            postfix={unit}
            onChange={onChange}
            onCreateOption={onCreateOption}
            value={selectedOption}
          />
        )
      }
    </Field>
  );
};
