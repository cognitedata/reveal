import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import type { AppLocationGenerics } from '../../../../../routes';
import { getOptionLabel, getInputOutputIndex } from '../utils';
import type {
  ConfigurationFieldProps,
  TimeSeriesPrefixProps,
  ValueOptionType,
} from '../utils';

interface UnitFieldProps
  extends ConfigurationFieldProps,
    TimeSeriesPrefixProps {}

export function Unit({ step, timeSeriesPrefix }: UnitFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const timeSeriesTarget = values[timeSeriesPrefix] ?? [];

  const { index: inputOutputIndex } = getInputOutputIndex(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );

  const timeSeriesUnitType =
    timeSeriesTarget[inputOutputIndex] &&
    timeSeriesTarget[inputOutputIndex].unitType;

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

  const TIMESERIES_UNIT_OPTIONS: ValueOptionType<string>[] =
    timeSeriesUnitType && unitsMap[timeSeriesUnitType]
      ? unitsMap[timeSeriesUnitType].units
      : [];
  // END GET OPTIONS

  const formikPath = `${timeSeriesPrefix}.${inputOutputIndex}.unit`;

  const value = timeSeriesTarget[inputOutputIndex] && {
    value: timeSeriesTarget[inputOutputIndex].unit ?? '',
    label: getOptionLabel(
      TIMESERIES_UNIT_OPTIONS,
      timeSeriesTarget[inputOutputIndex].unit ?? ''
    ),
  };

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={Select}
          disabled={!timeSeriesUnitType}
          label="Unit"
          inputId={formikPath}
          name={formikPath}
          options={TIMESERIES_UNIT_OPTIONS}
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
