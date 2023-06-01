import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type {
  DefinitionMap,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

import type { AppLocationGenerics } from 'routes';

interface UnitFieldProps extends ConfigurationFieldProps {
  timeSeriesPrefix: 'inputTimeSeries' | 'outputTimeSeries';
}

export function Unit({ routineIndex, step, timeSeriesPrefix }: UnitFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const timeSeriesTarget =
    timeSeriesPrefix === 'inputTimeSeries'
      ? values.inputTimeSeries
      : values.outputTimeSeries;

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const timeSerieIndex = getTimeSerieIndexByType(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );
  const tsIdx =
    timeSerieIndex !== -1 ? timeSerieIndex : timeSeriesTarget.length;
  const isUnitTypeInTimeSerie = Object.entries(timeSeriesTarget[tsIdx])
    .map(([entry]) => entry)
    .includes('unitType');

  if (!definitions || !isUnitTypeInTimeSerie) {
    return null;
  }

  const timeserieUnitType = timeSeriesTarget[tsIdx]
    .unitType as keyof DefinitionMap['map']['unitType'];

  const unitLabels = definitions.map.unitType[timeserieUnitType];
  const TIMESERIES_UNIT_OPTIONS: ValueOptionType<string>[] = Object.entries(
    unitLabels
  ).map(([value, label]) => ({ label, value }));
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
            value: timeSeriesTarget[tsIdx].unit,
            label: getOptionLabel(
              TIMESERIES_UNIT_OPTIONS,
              timeSeriesTarget[tsIdx].unit ?? ''
            ),
          }}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(`${timeSeriesPrefix}.${tsIdx}.unit`, value);
          }}
        />
      </div>
    </InputRow>
  );
}
