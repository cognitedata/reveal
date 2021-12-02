import { Field, useFormikContext } from 'formik';
import React from 'react';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import { INTERVAL_UNIT } from 'components/forms/ConfigurationForm/constants';
import { Select } from '@cognite/cogs.js';
import {
  DoubleInputRow,
  InputFullWidthForDouble,
  InputLabel,
  InputWithLabelContainerWide,
} from 'components/forms/elements';

interface ComponentProps {
  name: string;
  disabled: boolean;
  type: string;
  title: string;
}

function ValidationWindowInput({
  name,
  title,
  disabled,
  type,
}: React.PropsWithoutRef<ComponentProps>) {
  const { setFieldValue, errors, values } =
    useFormikContext<CalculationConfig>();

  const value = values.schedule.repeat;
  const intervalUnitValue = value
    ? (value.slice(-1) as keyof typeof INTERVAL_UNIT)
    : 'd';
  const intervalValue = value
    ? parseInt(value.substr(0, value.length - 1), 10)
    : 0;

  const handleSelectChange = ({
    value,
  }: {
    value: keyof typeof INTERVAL_UNIT;
  }) => {
    setFieldValue(name, intervalValue + value);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.value + intervalUnitValue);
  };

  return (
    <InputWithLabelContainerWide>
      <InputLabel>{title}</InputLabel>
      <DoubleInputRow>
        <Field
          // Workaround for an issue in cogs.js: Removing the title also
          // removes the input wrapper in the default state, which causes the
          // input field to lose focus when the validation state/error
          // message changes
          title=" "
          name={name}
          as={InputFullWidthForDouble}
          width="174px"
          value={intervalValue}
          disabled={disabled}
          type={type}
          error={errors.schedule?.repeat}
          onChange={handleInputChange}
        />

        <Field
          as={Select}
          theme="grey"
          value={{
            value: intervalUnitValue,
            label: `${INTERVAL_UNIT[intervalUnitValue]}${
              intervalValue > 1 ? 's' : ''
            }`,
          }}
          options={getSelectEntriesFromMap(INTERVAL_UNIT)}
          onChange={handleSelectChange}
          disabled={disabled}
          isDisabled={disabled}
          closeMenuOnSelect
          fullWidth
        />
      </DoubleInputRow>
    </InputWithLabelContainerWide>
  );
}

export default ValidationWindowInput;
