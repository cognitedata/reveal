import { InputRow } from '@simint-app/components/forms/ModelForm/elements';
import { Field, useFormikContext } from 'formik';

import { InputExp, Select } from '@cognite/cogs.js';
import { StepFields, UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import {
  ConfigurationFieldProps,
  ValueOptionType,
  getOptionLabel,
} from '../utils';

type DynamicFieldsProps = {
  dynamicStepFields: StepFields;
} & ConfigurationFieldProps;

export function DynamicFields({
  dynamicStepFields,
  routineIndex,
  stepIndex,
  step,
}: DynamicFieldsProps) {
  const { setFieldValue, getFieldMeta } = useFormikContext<UserDefined>();

  const commandKey =
    step.type === 'Get' || step.type === 'Set' ? 'get/set' : 'command';
  const stepType = dynamicStepFields?.steps.find(
    (step) => step.stepType === commandKey
  );
  const dynamicFields = stepType?.fields ?? [];

  return dynamicFields.map((field) => {
    const formikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments.${field.name}`;
    const { value } = getFieldMeta(formikPath) as { value: string };

    return (
      <InputRow key={field.name}>
        {field.options && field.options.length > 0 ? (
          <div className="cogs-input-container">
            <Field
              as={Select}
              label={field.label}
              inputId={formikPath}
              name={formikPath}
              width={300}
              options={field.options}
              fullWidth
              onChange={({ value }: ValueOptionType<string>) => {
                setFieldValue(formikPath, value);
              }}
              value={{
                value,
                label: getOptionLabel(field.options, value),
              }}
            />
          </div>
        ) : (
          <Field
            key={field.name}
            as={InputExp}
            id={formikPath}
            name={formikPath}
            style={{ width: 300 }}
            label={{
              text: field.label,
              info: field.info,
            }}
            fullWidth
          />
        )}
      </InputRow>
    );
  });
}
