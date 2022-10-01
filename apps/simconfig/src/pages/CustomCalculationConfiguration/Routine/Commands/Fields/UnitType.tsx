import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

import type { AppLocationGenerics } from 'routes';

export function UnitType({ routineIndex, step }: ConfigurationFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();
  if (!definitions) {
    return null;
  }

  const unitLabels = definitions.map.unitLabel;
  const TIMESERIES_UNIT_TYPE_OPTIONS: ValueOptionType<string>[] =
    Object.entries(unitLabels).map(([value, label]) => ({ label, value }));
  const timeSerieIndex = getTimeSerieIndexByType(
    values.inputTimeSeries,
    step.arguments.value ?? ''
  );
  const tsIdx =
    timeSerieIndex !== -1 ? timeSerieIndex : values.inputTimeSeries.length;
  const formikPath = `routine.inputTimeSeries.${routineIndex}.unitType`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Unit Type</div>
        <Field
          as={Select}
          name={formikPath}
          options={TIMESERIES_UNIT_TYPE_OPTIONS}
          value={{
            value: values.inputTimeSeries[tsIdx].unitType,
            label: getOptionLabel(
              TIMESERIES_UNIT_TYPE_OPTIONS,
              values.inputTimeSeries[tsIdx].unitType
            ),
          }}
          width={300}
          onChange={({ value }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(`inputTimeSeries.${tsIdx}.unitType`, value);
          }}
        />
      </div>
    </InputRow>
  );
}
