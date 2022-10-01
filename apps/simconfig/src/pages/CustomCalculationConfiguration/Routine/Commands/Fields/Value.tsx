import { Field, useFormikContext } from 'formik';

import { Input } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import type { ConfigurationFieldProps } from '../utils';

export function Value({
  routineIndex,
  stepIndex,
  step,
}: ConfigurationFieldProps) {
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.value`;

  return (
    <InputRow>
      <Field
        as={Input}
        name={formikPath}
        style={{ width: 300 }}
        title="Value"
        value={step.arguments.value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = event.target;
          setFieldValue(formikPath, value);
        }}
      />
    </InputRow>
  );
}
