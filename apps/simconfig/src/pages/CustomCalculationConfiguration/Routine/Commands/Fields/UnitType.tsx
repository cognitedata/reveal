import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js-v9';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';
import { getTargetTimeseriesByPrefix } from 'utils/routineUtils';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type {
  ConfigurationFieldProps,
  TimeSeriesPrefixProps,
  ValueOptionType,
} from '../utils';

import type { AppLocationGenerics } from 'routes';

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

  const unitLabels = definitions.map.unitLabel;
  const TIMESERIES_UNIT_TYPE_OPTIONS: ValueOptionType<string>[] =
    Object.entries(unitLabels).map(([value, label]) => ({ label, value }));
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
