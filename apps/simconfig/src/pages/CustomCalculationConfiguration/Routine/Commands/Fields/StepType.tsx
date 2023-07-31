import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js-v9';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { ACTION_OPTIONS, getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

type StepOption = 'Command' | 'Get' | 'Set';

const mapStep = {
  Get: {
    type: 'Get',
    arguments: {
      address: '',
      type: 'outputTimeSeries',
    },
  },
  Set: {
    type: 'Set',
    arguments: {
      address: '',
      type: 'manual',
    },
  },
  Command: {
    type: 'Command',
    arguments: {
      address: '',
    },
  },
};

export function StepType({
  routineIndex,
  stepIndex,
  step,
}: ConfigurationFieldProps) {
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Step type</div>
        <Field
          as={Select}
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
          }}
        />
      </div>
    </InputRow>
  );
}
