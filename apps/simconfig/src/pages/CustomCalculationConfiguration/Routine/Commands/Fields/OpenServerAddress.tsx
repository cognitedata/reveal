import { Field, useFormikContext } from 'formik';

import { Input } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from 'components/forms/ModelForm/elements';

import type { ConfigurationFieldProps } from '../utils';

export function OpenServerAddress({
  routineIndex,
  stepIndex,
  step,
}: ConfigurationFieldProps) {
  const { setFieldValue } = useFormikContext<UserDefined>();
  const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.address`;

  return (
    <InputRow>
      <Field
        as={Input}
        name={formikPath}
        style={{ width: 300 }}
        title="OpenServer Address"
        value={step.arguments.address}
        fullWidth
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = event.target;
          setFieldValue(formikPath, value);
        }}
      />
    </InputRow>
  );
}
