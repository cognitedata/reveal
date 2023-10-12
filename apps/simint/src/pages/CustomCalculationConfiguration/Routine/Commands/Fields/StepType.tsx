import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import { removeEntryFromInputOutputArray } from '../../utils';
import { ACTION_OPTIONS, getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

import { StepInputType } from './InputType';

type StepOption = 'Command' | 'Get' | 'Set';

const mapStep = {
  Get: {
    type: 'Get',
    arguments: {
      type: StepInputType.OutputTimeSeries,
    },
  },
  Set: {
    type: 'Set',
    arguments: {
      type: StepInputType.InputConstant,
    },
  },
  Command: {
    type: 'Command',
    arguments: {},
  },
};

export function StepType({
  routineIndex,
  stepIndex,
  step,
}: ConfigurationFieldProps) {
  const { setFieldValue, values } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={Select}
          label="Step type"
          inputId={formikPath}
          name={formikPath}
          options={ACTION_OPTIONS}
          value={{
            value: step.type,
            label: getOptionLabel(ACTION_OPTIONS, step.type),
          }}
          width={300}
          onChange={(option: ValueOptionType<StepOption>) => {
            setFieldValue(`${formikPath}`, {
              step: step.step,
              ...mapStep[option.value],
            });

            if (!step.arguments.value) {
              return;
            }

            // remove the input/output of the previously selected step type
            if (step.type === 'Set') {
              const updatedInputConstants = removeEntryFromInputOutputArray(
                values.inputConstants ?? [],
                step.arguments.value
              );

              setFieldValue('inputConstants', updatedInputConstants);
            } else if (step.type === 'Get') {
              const updatedOutputTimeSeries = removeEntryFromInputOutputArray(
                values.outputTimeSeries ?? [],
                step.arguments.value
              );

              setFieldValue('outputTimeSeries', updatedOutputTimeSeries);
            }
          }}
        />
      </div>
    </InputRow>
  );
}
