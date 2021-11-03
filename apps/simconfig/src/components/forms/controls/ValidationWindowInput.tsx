import { Field, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import { INTERVAL_UNIT } from 'components/forms/ConfigurationForm/constants';
import { Input, Select } from '@cognite/cogs.js';
import {
  DoubleInputRow,
  InputWithLabelContainer,
  InputLabel,
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
  const { getFieldProps, setFieldValue } =
    useFormikContext<CalculationConfig>();
  const { value } = getFieldProps(name);

  const [intervalUnitValue, setIntervalUnitValue] = useState<
    keyof typeof INTERVAL_UNIT
  >(value ? value.slice(-1) : 'd');

  const [intervalValue, setIntervalValue] = useState(
    value ? value.substr(0, value.length - 1) : 0
  );

  const handleSelectChange = ({
    value,
  }: {
    value: keyof typeof INTERVAL_UNIT;
  }) => {
    setIntervalUnitValue(value);
    setFieldValue(name, intervalValue + value);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIntervalValue(e.target.value);
    setFieldValue(name, e.target.value + intervalUnitValue);
  };

  return (
    <>
      <InputWithLabelContainer>
        <InputLabel>{title}</InputLabel>
        <DoubleInputRow>
          <Field
            as={Input}
            value={intervalValue}
            disabled={disabled}
            type={type}
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
      </InputWithLabelContainer>
    </>
  );
}

export default ValidationWindowInput;
