import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

import type { AppLocationGenerics } from 'routes';

export function Unit({ routineIndex, step }: ConfigurationFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const timeSerieIndex = getTimeSerieIndexByType(
    values.inputTimeSeries,
    step.arguments.value ?? ''
  );
  const tsIdx =
    timeSerieIndex !== -1 ? timeSerieIndex : values.inputTimeSeries.length;
  const isUnitTypeInTimeSerie = Object.entries(
    values.inputTimeSeries[tsIdx] ?? {}
  )
    .map(([entry]) => entry)
    .includes('unitType');

  if (!definitions || !isUnitTypeInTimeSerie) {
    return null;
  }

  const timeserieUnitType = values.inputTimeSeries[tsIdx].unitType;
  const unitLabels = definitions.map.unitType[timeserieUnitType];
  const TIMESERIES_UNIT_OPTIONS: ValueOptionType<string>[] = Object.entries(
    unitLabels
  ).map(([value, label]) => ({ label, value }));
  const formikPath = `routine.inputTimeSeries.${routineIndex}.unit`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Unit</div>
        <Field
          as={Select}
          name={formikPath}
          options={TIMESERIES_UNIT_OPTIONS}
          value={{
            value: values.inputTimeSeries[tsIdx].unit,
            label: getOptionLabel(
              TIMESERIES_UNIT_OPTIONS,
              values.inputTimeSeries[tsIdx].unit ?? ''
            ),
          }}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(`inputTimeSeries.${tsIdx}.unit`, value);
          }}
        />
      </div>
    </InputRow>
  );
}
