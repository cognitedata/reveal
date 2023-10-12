import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import { removeEntryFromInputOutputArray } from '../../utils';
import { getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

export enum StepInputType {
  InputConstant = 'inputConstant',
  InputTimeSeries = 'inputTimeSeries',
  OutputTimeSeries = 'outputTimeSeries',
}

const INPUT_TYPE_OPTIONS: ValueOptionType<StepInputType>[] = [
  { label: 'Time series', value: StepInputType.InputTimeSeries },
  { label: 'Manual', value: StepInputType.InputConstant },
];

export function InputType({
  routineIndex,
  step,
  stepIndex,
}: ConfigurationFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();

  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={Select}
          label="Input type"
          inputId={formikPath}
          name={formikPath}
          options={INPUT_TYPE_OPTIONS}
          value={
            step.arguments.type && {
              value: step.arguments.type,
              label: getOptionLabel(INPUT_TYPE_OPTIONS, step.arguments.type),
            }
          }
          width={300}
          onChange={(option: ValueOptionType<StepInputType>) => {
            setFieldValue(formikPath, { type: option.value });

            if (!step.arguments.value) {
              return;
            }

            // if user selected input constant, we need to remove the input time series
            // if one was set, and vice versa
            if (option.value === StepInputType.InputConstant) {
              const updatedInputTimeSeries = removeEntryFromInputOutputArray(
                values.inputTimeSeries ?? [],
                step.arguments.value
              );

              setFieldValue('inputTimeSeries', updatedInputTimeSeries);
            } else {
              // else remove inputConstant
              const updatedInputConstants = removeEntryFromInputOutputArray(
                values.inputConstants ?? [],
                step.arguments.value
              );

              setFieldValue('inputConstants', updatedInputConstants);
            }
          }}
        />
      </div>
    </InputRow>
  );
}
