import { useState } from 'react';

import { Field, useFormikContext } from 'formik';

import { Input } from '@cognite/cogs.js';
import type {
  InputTimeSeries,
  OutputTimeSeries,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getTimeSerieIndexByType } from '../utils';
import type { ConfigurationFieldProps } from '../utils';

interface VariableFieldProps extends ConfigurationFieldProps {
  timeSeriesPrefix: 'inputTimeSeries' | 'outputTimeSeries';
}

export function Variable({
  step,
  stepIndex,
  routineIndex,
  timeSeriesPrefix,
}: VariableFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();

  // state for setting variable error message
  const [variableError, setVariableError] = useState<string>('');

  const timeSeriesTarget =
    timeSeriesPrefix === 'inputTimeSeries'
      ? values.inputTimeSeries
      : values.outputTimeSeries;

  const timeSerieIndex = getTimeSerieIndexByType(
    timeSeriesTarget,
    step.arguments.value ?? ''
  );
  const tsIdx =
    timeSerieIndex !== -1 ? timeSerieIndex : timeSeriesTarget.length;
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.value`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Variable</div>
        <Field
          as={Input}
          error={variableError}
          name={formikPath}
          style={{ width: 300 }}
          type="text"
          validate={() => {
            // Find the name of the current variable
            const { name } = timeSeriesTarget[tsIdx];

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
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          value={timeSeriesTarget[tsIdx]?.name ?? ''}
          fullWidth
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = event.currentTarget;
            const type = `${value
              .trim()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase())
              .join('')}${tsIdx}`;
            setFieldValue(formikPath, type);
            setFieldValue(`${timeSeriesPrefix}.${tsIdx}.type`, type);
            setFieldValue(`${timeSeriesPrefix}.${tsIdx}.name`, value.trim());
          }}
        />
      </div>
    </InputRow>
  );
}
