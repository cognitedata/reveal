import { Field, useFormikContext } from 'formik';

import { InputExp } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import { getInputOutputIndex, type ConfigurationFieldProps } from '../utils';

export function Value({ step }: ConfigurationFieldProps) {
  const { getFieldMeta, values } = useFormikContext<UserDefined>();

  const { index: constantIndex, didFindEntry } = getInputOutputIndex(
    values.inputConstants ?? [],
    step.arguments.value ?? ''
  );

  const formikPath = `inputConstants.${constantIndex}.value`;
  const { value } = getFieldMeta(formikPath) as { value: string };

  return (
    <InputRow>
      <Field
        as={InputExp}
        disabled={!didFindEntry}
        id={formikPath}
        name={formikPath}
        style={{ width: 300 }}
        value={value ?? ''}
        label="Value"
      />
    </InputRow>
  );
}
