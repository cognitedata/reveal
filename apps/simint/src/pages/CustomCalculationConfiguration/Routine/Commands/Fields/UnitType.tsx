import { useMatch } from 'react-location';

import { InputRow } from '@simint-app/components/forms/ModelForm/elements';
import type { AppLocationGenerics } from '@simint-app/routes';
import { getTargetTimeseriesByPrefix } from '@simint-app/utils/routineUtils';
import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type {
  ConfigurationFieldProps,
  TimeSeriesPrefixProps,
  ValueOptionType,
} from '../utils';

interface UnitTypeFieldProps
  extends ConfigurationFieldProps,
    TimeSeriesPrefixProps {}

export function UnitType({
  routineIndex,
  step,
  timeSeriesPrefix,
}: UnitTypeFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const timeSeriesTarget = getTargetTimeseriesByPrefix(
    timeSeriesPrefix,
    values
  );

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

  const TIMESERIES_UNIT_TYPE_OPTIONS: ValueOptionType<string>[] =
    Object.entries(unitsMap).map(([key, value]) => ({
      value: key,
      label: value.label,
    }));

  const routineTimeSerieIndex = getTimeSerieIndexByType(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );
  const stepTimeserieIndex =
    routineTimeSerieIndex !== -1
      ? routineTimeSerieIndex
      : timeSeriesTarget.length;
  const formikPath = `routine.${timeSeriesPrefix}.${routineIndex}.unitType`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Unit Type</div>
        <Field
          as={Select}
          name={formikPath}
          options={TIMESERIES_UNIT_TYPE_OPTIONS}
          value={{
            value: timeSeriesTarget[stepTimeserieIndex].unitType,
            label: getOptionLabel(
              TIMESERIES_UNIT_TYPE_OPTIONS,
              timeSeriesTarget[stepTimeserieIndex].unitType
            ),
          }}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(
              `${timeSeriesPrefix}.${stepTimeserieIndex}.unitType`,
              value
            );
          }}
        />
      </div>
    </InputRow>
  );
}
