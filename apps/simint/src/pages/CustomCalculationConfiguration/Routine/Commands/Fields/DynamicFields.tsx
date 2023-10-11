import { Field, useFormikContext } from 'formik';

import { InputExp, Select } from '@cognite/cogs.js';
import { StepFields, UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { InputRow } from '../../../../../components/forms/ModelForm/elements';
import { generateInputTimeSeriesExternalId } from '../../../../../utils/externalIdGenerators';
import {
  getStepIdentifier,
  sanitizeStepInput,
} from '../../../../../utils/stringUtils';
import {
  ConfigurationFieldProps,
  ValueOptionType,
  getOptionLabel,
  getInputOutputIndex,
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
  const { setFieldValue, getFieldMeta, values } =
    useFormikContext<UserDefined>();

  const commandKey =
    step.type === 'Get' || step.type === 'Set' ? 'get/set' : 'command';
  const stepType = dynamicStepFields?.steps?.find(
    (step) => step.stepType === commandKey
  );
  const dynamicFields = stepType?.fields ?? [];
  const stepArgumentsFormikPath = `routine.${routineIndex}.steps.${stepIndex}.arguments`;

  const { index: inputConstantIndex } = getInputOutputIndex(
    values.inputConstants ?? [],
    step.arguments.value ?? ''
  );

  return dynamicFields.map((dynamicField) => {
    const fieldFormikPath = `${stepArgumentsFormikPath}.${dynamicField.name}`;
    const { value } = getFieldMeta(fieldFormikPath) as { value: string };

    return (
      <InputRow key={dynamicField.name}>
        {dynamicField.options && dynamicField.options.length > 0 ? (
          <div className="cogs-input-container">
            <Field
              as={Select}
              label={dynamicField.label}
              inputId={fieldFormikPath}
              name={fieldFormikPath}
              width={300}
              options={dynamicField.options}
              fullWidth
              onChange={({ value }: ValueOptionType<string>) => {
                setFieldValue(fieldFormikPath, value);
              }}
              value={{
                value: value ?? '',
                label: getOptionLabel(dynamicField.options, value),
              }}
            />
          </div>
        ) : (
          <Field
            key={dynamicField.name}
            as={InputExp}
            fullWidth
            id={fieldFormikPath}
            name={fieldFormikPath}
            style={{ width: 300 }}
            label={{
              text: dynamicField.label,
              info: dynamicField.info,
            }}
            value={value ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = event.currentTarget;

              setFieldValue(fieldFormikPath, value);

              /*
              For a Set step using inputConstant, we need to set the value in the routine
              step and the type in the inputConstants entry.
               */
              if (
                step.type === 'Set' &&
                step.arguments.type === 'inputConstant'
              ) {
                // concatenate all values from all dynamic fields
                const fieldValues = dynamicFields.map((field) => {
                  if (field.name === dynamicField.name) {
                    return value;
                  }

                  const { value: fieldValue } = getFieldMeta(
                    `${stepArgumentsFormikPath}.${field.name}`
                  ) as { value: string | undefined };

                  return fieldValue ?? '';
                });

                // ['/Crude_Feed/VMGOPStream.MassFlow'] -> 'Crude Feed VMGOPStream MassFlow'
                // ['Hot Crude', 'Material Stream', 'Temperature'] -> 'Hot Crude Material Stream Temperature'
                const sanitizedName = fieldValues
                  .filter((fieldValue) => fieldValue !== '') // filter out unfilled fields
                  .map(sanitizeStepInput)
                  .join(' ');

                // 'Crude Feed VMGOPStream MassFlow' -> 'CFVM0'
                // 'Hot Crude Material Stream Temperature' -> 'HCMST1'
                const identifier = getStepIdentifier(
                  sanitizedName,
                  inputConstantIndex
                );

                // set identifier as value in routine step
                setFieldValue(`${stepArgumentsFormikPath}.value`, identifier);

                // set identifier as type in inputConstants entry
                setFieldValue(
                  `inputConstants.${inputConstantIndex}.type`,
                  identifier
                );

                // set saveTimeseriesExternalId in inputConstants entry
                setFieldValue(
                  `inputConstants.${inputConstantIndex}.saveTimeseriesExternalId`,
                  generateInputTimeSeriesExternalId({
                    simulator: values.simulator,
                    calculationType: values.calculationName,
                    modelName: values.modelName,
                    timeSeriesType: identifier,
                  })
                );

                // set name in inputConstants entry
                setFieldValue(
                  `inputConstants.${inputConstantIndex}.name`,
                  `${sanitizedName} - Constant`
                );
              }
            }}
          />
        )}
      </InputRow>
    );
  });
}
