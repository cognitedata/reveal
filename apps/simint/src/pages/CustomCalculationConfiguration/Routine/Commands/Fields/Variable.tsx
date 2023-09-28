import { useState } from 'react';
import { useMatch } from 'react-location';

import { InputRow } from '@simint-app/components/forms/ModelForm/elements';
import type { AppLocationGenerics } from '@simint-app/routes';
import { Field, useFormikContext } from 'formik';

import { InputExp } from '@cognite/cogs.js';
import type {
  InputTimeSeries,
  OutputTimeSeries,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { getInputOutputIndex } from '../utils';
import type {
  ConfigurationFieldProps,
  TimeSeriesPrefixProps,
  ValueOptionType,
} from '../utils';

interface VariableFieldProps
  extends ConfigurationFieldProps,
    TimeSeriesPrefixProps {}

export function Variable({
  step,
  stepIndex,
  routineIndex,
  timeSeriesPrefix,
}: VariableFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  // state for setting variable error message
  const [variableError, setVariableError] = useState<string>('');

  const timeSeriesTarget = values[timeSeriesPrefix];

  const currentTimeSeries = timeSeriesTarget.map((ts) => ts.type);
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

  const { index: inputOutputIndex } = getInputOutputIndex(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );

  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.value`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={InputExp}
          error={variableError}
          label="Variable"
          name={formikPath}
          options={TIMESERIES_VARIABLE_OPTIONS}
          style={{ width: 300 }}
          type="text"
          validate={() => {
            // Find the name of the current variable
            const name = timeSeriesTarget[inputOutputIndex]?.name;

            if (!name) {
              return undefined;
            }
            // Find all the other variables with the same name
            const otherInputVariableNames = values.inputTimeSeries.map(
              (ts: InputTimeSeries | OutputTimeSeries) => ts.name
            );
            const otherOutputVariableNames = values.outputTimeSeries.map(
              (ts: InputTimeSeries | OutputTimeSeries) => ts.name
            );

            const otherVariableNames = [
              ...otherInputVariableNames,
              ...otherOutputVariableNames,
            ];

            const isDuplicate =
              otherVariableNames.filter(
                (variableName: string) =>
                  variableName.toLowerCase() === name.toLowerCase()
              ).length > 1;

            if (isDuplicate) {
              setVariableError('Duplicate variable name');
            } else {
              setVariableError('');
            }

            return undefined;
          }}
          value={timeSeriesTarget[inputOutputIndex]?.name ?? ''}
          fullWidth
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;
            const type = `${value
              .trim()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase())
              .join('')}${inputOutputIndex}`;
            setFieldValue(formikPath, type);
            setFieldValue(`${timeSeriesPrefix}.${inputOutputIndex}.type`, type);
            setFieldValue(
              `${timeSeriesPrefix}.${inputOutputIndex}.name`,
              value.trim()
            );
          }}
        />
      </div>
    </InputRow>
  );
}
