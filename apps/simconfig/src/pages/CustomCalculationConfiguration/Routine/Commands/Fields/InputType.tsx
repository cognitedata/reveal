import { Field, useFormikContext } from 'formik';

import { Select } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import { getOptionLabel } from '../utils';
import type { ConfigurationFieldProps, ValueOptionType } from '../utils';

const INPUT_TYPE_OPTIONS: ValueOptionType<string>[] = [
  { label: 'Time series', value: 'inputTimeSeries' },
  { label: 'Manual', value: 'manual' },
];

export function InputType({
  routineIndex,
  step,
  stepIndex,
}: ConfigurationFieldProps) {
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.type`;
  return (
    <InputRow>
      <div className="cogs-input-container">
        <div className="title">Input type</div>
        <Field
          as={Select}
          name={formikPath}
          options={INPUT_TYPE_OPTIONS}
          value={
            step.arguments.type && {
              value: step.arguments.type,
              label: getOptionLabel(INPUT_TYPE_OPTIONS, step.arguments.type),
            }
          }
          width={300}
          onChange={(option: ValueOptionType<string>) => {
            setFieldValue(formikPath, option.value);
          }}
        />
      </div>
    </InputRow>
  );
}
