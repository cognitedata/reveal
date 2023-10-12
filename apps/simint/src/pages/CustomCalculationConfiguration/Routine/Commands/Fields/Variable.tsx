import { useState } from 'react';
import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import { InputExp } from '@cognite/cogs.js';
import type {
  InputTimeSeries,
  OutputTimeSeries,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import type { AppLocationGenerics } from '../../../../../routes';
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
  const { setFieldValue, values, validateField } =
    useFormikContext<UserDefined>();
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
          id={formikPath}
          status={variableError ? 'critical' : undefined}
          statusText={variableError}
          label="Variable"
          name={formikPath}
          options={TIMESERIES_VARIABLE_OPTIONS}
          style={{ width: 300 }}
          type="text"
          validate={() => {
            // Find the name of the current variable
            let error = '';
            const name = timeSeriesTarget[inputOutputIndex]?.name?.trim();

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
              error = 'Duplicate variable name';
            }
            setVariableError(error);

            return error;
          }}
          value={timeSeriesTarget[inputOutputIndex]?.name ?? ''}
          fullWidth
          onBlur={async (event: React.FocusEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;

            await setFieldValue(
              `${timeSeriesPrefix}.${inputOutputIndex}.name`,
              value?.trim()
            );

            validateField(formikPath);
          }}
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
              value
            );
          }}
        />
      </div>
    </InputRow>
  );
}
