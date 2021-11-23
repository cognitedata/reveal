import { Field, useFormikContext } from 'formik';
import React from 'react';
import { CalculationConfig } from 'components/forms/ConfigurationForm/types';
import { getSelectEntriesFromMap } from 'utils/formUtils';
import { INTERVAL_UNIT } from 'components/forms/ConfigurationForm/constants';
import { Select } from '@cognite/cogs.js';
import {
  DoubleInputRow,
  InputFullWidth,
  InputLabel,
  InputWithLabelContainerWide,
} from 'components/forms/elements';

interface ComponentProps {
  name: string;
  disabled: boolean;
  type: string;
  title: string;
  value: string;
}
function ValidationWindowInput({
  name,
  title,
  disabled,
  type,
  value,
}: React.PropsWithoutRef<ComponentProps>) {
  const { setFieldValue, errors, values } =
    useFormikContext<CalculationConfig>();
  const validationValue = values.dataSampling.validationWindow;

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

  const getValueInMinutes = (value: number) => {
    const multiplicative = {
      m: 1,
      h: 60,
      d: 60 * 24,
      w: 60 * 24 * 7,
    };
    return value * multiplicative[intervalUnitValue];
  };

  const validateInterval = () => {
    const valueInMinutes = getValueInMinutes(intervalValue);

    if (valueInMinutes < validationValue) {
      return 'repeat cannot be more frequent than validation window';
    }
    if (valueInMinutes < 15) {
      return 'Cannot repeat more frequently than 15 mins';
    }
    return undefined;
  };

  return (
    <>
      <InputWithLabelContainerWide>
        <InputLabel>{title}</InputLabel>
        <DoubleInputRow>
          <Field
            name={name}
            as={InputFullWidth}
            width="174px"
            value={intervalValue}
            disabled={disabled}
            type={type}
            error={errors.schedule?.repeat}
            validate={validateInterval}
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
    </>
  );
}

export default ValidationWindowInput;
