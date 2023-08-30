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

interface UnitFieldProps
  extends ConfigurationFieldProps,
    TimeSeriesPrefixProps {}

export function Unit({ routineIndex, step, timeSeriesPrefix }: UnitFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const timeSeriesTarget = getTargetTimeseriesByPrefix(
    timeSeriesPrefix,
    values
  );

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const routineTimeSerieIndex = getTimeSerieIndexByType(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );

  //
  // when the timeseries index is not found, it means that the step is a new one
  // which means that the index is the last and current one
  // if the index is found, it will overwrite the found timeseries index
  const stepTimeserieIndex =
    routineTimeSerieIndex !== -1
      ? routineTimeSerieIndex
      : timeSeriesTarget.length;
  const isUnitTypeInTimeSerie = Object.entries(
    timeSeriesTarget[stepTimeserieIndex]
  )
    .map(([entry]) => entry)
    .includes('unitType');

  if (!definitions || !isUnitTypeInTimeSerie) {
    return null;
  }

  const timeSeriesUnitType = timeSeriesTarget[stepTimeserieIndex].unitType;

  const simulatorConfig = definitions.simulatorsConfig?.find(
    (config) => config.key === values.simulator
  );
  const unitsMap = simulatorConfig?.unitDefinitions.unitsMap ?? {};

  const TIMESERIES_UNIT_OPTIONS: ValueOptionType<string>[] =
    (unitsMap[timeSeriesUnitType] && unitsMap[timeSeriesUnitType].units) ?? [];

  const formikPath = `routine.${timeSeriesPrefix}.${routineIndex}.unit`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Unit</div>
        <Field
          as={Select}
          name={formikPath}
          options={TIMESERIES_UNIT_OPTIONS}
          value={{
            value: timeSeriesTarget[stepTimeserieIndex].unit,
            label: getOptionLabel(
              TIMESERIES_UNIT_OPTIONS,
              timeSeriesTarget[stepTimeserieIndex].unit ?? ''
            ),
          }}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(
              `${timeSeriesPrefix}.${stepTimeserieIndex}.unit`,
              value
            );
          }}
        />
      </div>
    </InputRow>
  );
}
