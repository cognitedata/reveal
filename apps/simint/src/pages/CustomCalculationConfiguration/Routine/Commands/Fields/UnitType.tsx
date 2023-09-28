import { useMatch } from 'react-location';

import { InputRow } from '@simint-app/components/forms/ModelForm/elements';
import type { AppLocationGenerics } from '@simint-app/routes';
import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { getOptionLabel, getInputOutputIndex } from '../utils';
import type {
  ConfigurationFieldProps,
  TimeSeriesPrefixProps,
  ValueOptionType,
} from '../utils';

interface UnitTypeFieldProps
  extends ConfigurationFieldProps,
    TimeSeriesPrefixProps {}

export function UnitType({ step, timeSeriesPrefix }: UnitTypeFieldProps) {
  const { setFieldValue, values, getFieldMeta } =
    useFormikContext<UserDefined>();

  // GET OPTIONS
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();
  if (!definitions) {
    return null;
  }

  const simulatorConfig = definitions.simulatorsConfig?.find(
    (config) => config.key === values.simulator
  );
  const unitsMap = simulatorConfig?.unitDefinitions.unitsMap ?? {};

  const UNIT_TYPE_OPTIONS: ValueOptionType<string>[] = Object.entries(
    unitsMap
  ).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));
  // END GET OPTIONS

  const timeSeriesTarget = values[timeSeriesPrefix] ?? [];

  // get index of matching entry in corresponding bucket
  const { index: inputOutputIndex, didFindEntry } = getInputOutputIndex(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );

  const formikPath = `${timeSeriesPrefix}.${inputOutputIndex}.unitType`;
  const { value: unitType } = getFieldMeta(formikPath) as { value: string };

  const value = unitType
    ? {
        value: unitType,
        label: getOptionLabel(UNIT_TYPE_OPTIONS, unitType),
      }
    : undefined;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={Select}
          disabled={!didFindEntry}
          label="Unit Type"
          inputId={formikPath}
          name={formikPath}
          options={UNIT_TYPE_OPTIONS}
          value={value}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
          }}
        />
      </div>
    </InputRow>
  );
}
