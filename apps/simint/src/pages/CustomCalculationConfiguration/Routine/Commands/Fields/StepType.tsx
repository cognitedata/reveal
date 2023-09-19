import { InputRow } from '@simint-app/components/forms/ModelForm/elements';
import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { ACTION_OPTIONS, getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

type StepOption = 'Command' | 'Get' | 'Set';

const mapStep = {
  Get: {
    type: 'Get',
    arguments: {
      type: 'outputTimeSeries',
    },
  },
  Set: {
    type: 'Set',
    arguments: {
      type: 'manual',
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
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}`;

  return (
    <InputRow>
      <div className="cogs-input-container">
        <Field
          as={Select}
          label="Step type"
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
