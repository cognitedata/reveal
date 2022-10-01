import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getOptionLabel, getTimeSerieIndexByType } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

import type { AppLocationGenerics } from 'routes';

export function Variable({
  step,
  stepIndex,
  routineIndex,
}: ConfigurationFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const currentTimeSeries = values.inputTimeSeries.map(
    (ts) => ts.type
  ) as string[];
  const currentValue =
    values.routine?.[routineIndex].steps[stepIndex].arguments.value;
  const TIMESERIES_VARIABLE_OPTIONS: ValueOptionType<string>[] = Object.entries(
    definitions?.type.timeSeries ?? {}
  )
    .map(([value, { name }]) => ({ label: name, value }))
    .filter(
      ({ value }) =>
        !currentTimeSeries.includes(value) || value === currentValue
    );
  const timeSerieIndex = getTimeSerieIndexByType(
    values.inputTimeSeries,
    step.arguments.value ?? ''
  );
  const tsIdx =
    timeSerieIndex !== -1 ? timeSerieIndex : values.inputTimeSeries.length;
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.value`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Variable</div>
        <Field
          as={Select}
          name={formikPath}
          options={TIMESERIES_VARIABLE_OPTIONS}
          value={{
            value: step.arguments.value,
            label: getOptionLabel(
              TIMESERIES_VARIABLE_OPTIONS,
              step.arguments.value ?? ''
            ),
          }}
          width={300}
          onChange={({ value, label }: ValueOptionType<string>) => {
            setFieldValue(formikPath, value);
            setFieldValue(`inputTimeSeries.${tsIdx}.type`, value);
            setFieldValue(`inputTimeSeries.${tsIdx}.name`, label);
          }}
        />
      </div>
    </InputRow>
  );
}
