import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { ACTION_OPTIONS, getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

export function StepType({
  routineIndex,
  stepIndex,
  step,
}: ConfigurationFieldProps) {
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.type`;

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
          onChange={(option: ValueOptionType<string>) => {
            setFieldValue(formikPath, option.value);
          }}
        />
      </div>
    </InputRow>
  );
}
