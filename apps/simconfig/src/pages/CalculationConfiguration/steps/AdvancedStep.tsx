import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Label, Select, Switch } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRowStacked,
  NumberField,
} from 'components/forms/elements';

import type { StepProps } from '../types';

import type { AppLocationGenerics } from 'routes';

export function AdvancedStep({ isEditing }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  if (!definitions) {
    return null;
  }

  if (
    values.calculationType !== 'IPR' &&
    values.calculationType !== 'VLP' &&
    values.calculationType !== 'ChokeDp'
  ) {
    return null;
  }

  const bhpEstimationMethodOptions: OptionType<string>[] = Object.entries(
    definitions.type.bhpEstimationMethod
  ).map(([value, label]) => ({ value, label }));

  const lengthUnitOptions: OptionType<string>[] = Object.entries(
    definitions.unit.length
  ).map(([value, label]) => ({ value, label }));

  const rootFindingSolutionOptions: OptionType<string>[] = Object.entries(
    definitions.type.rootFindingSolution
  ).map(([value, label]) => ({ value, label }));

  return (
    <FormContainer>
      {values.calculationType === 'ChokeDp' ? (
        <>
          <FormHeader>Choke curve</FormHeader>
          <div className="cogs-input-container">
            <div className="title">Unit</div>
            <Field
              as={Select}
              name="chokeCurve.unit"
              options={lengthUnitOptions}
              value={lengthUnitOptions.find(
                (option) => option.value === values.chokeCurve?.unit
              )}
              closeMenuOnSelect
              onChange={({ value }: OptionType<string>) => {
                setFieldValue('chokeCurve.unit', value);
              }}
            />
          </div>
          {values.chokeCurve?.opening.map((opening, index) => (
            <FormRowStacked key={opening}>
              <NumberField
                max={100}
                min={0}
                name={`chokeCurve.opening.${index}`}
                step={1}
                title="Opening"
                width={120}
              />
              <NumberField
                name={`chokeCurve.setting.${index}`}
                title="Value"
                width={120}
              />
              <Label
                icon="AddLarge"
                size="small"
                onClick={() => {
                  const opening = [...(values.chokeCurve?.opening ?? [])];
                  opening.splice(
                    index,
                    0,
                    values.chokeCurve?.opening[index] ?? 0
                  );
                  setFieldValue('chokeCurve.opening', opening);

                  const setting = [...(values.chokeCurve?.setting ?? [])];
                  setting.splice(
                    index,
                    0,
                    values.chokeCurve?.setting[index] ?? 0
                  );
                  setFieldValue('chokeCurve.setting', setting);
                }}
              />
              <Label
                icon="Delete"
                size="small"
                variant="danger"
                onClick={() => {
                  const opening = [...(values.chokeCurve?.opening ?? [])];
                  opening.splice(index, 1);
                  setFieldValue('chokeCurve.opening', opening);

                  const setting = [...(values.chokeCurve?.setting ?? [])];
                  setting.splice(index, 1);
                  setFieldValue('chokeCurve.setting', setting);
                }}
              />
            </FormRowStacked>
          ))}
        </>
      ) : (
        <>
          <FormHeader>
            BHP estimation
            <Field
              as={Switch}
              checked={values.estimateBHP.enabled}
              defaultChecked={false}
              name="estimateBHP.enabled"
              onChange={(value: boolean) => {
                setFieldValue('estimateBHP.enabled', value);
              }}
            />
          </FormHeader>
          {values.estimateBHP.enabled ? (
            <FormRowStacked>
              <div className="cogs-input-container">
                <div className="title">Method</div>
                <Field
                  as={Select}
                  isDisabled={isEditing}
                  name="estimateBHP.method"
                  options={bhpEstimationMethodOptions}
                  value={bhpEstimationMethodOptions.find(
                    (option) => option.value === values.estimateBHP.method
                  )}
                  closeMenuOnSelect
                  onChange={({ value }: OptionType<string>) => {
                    setFieldValue('estimateBHP.method', value);
                  }}
                />
              </div>
              {values.estimateBHP.method === 'GradientTraverse' ? (
                <>
                  <NumberField
                    disabled={isEditing}
                    min={0}
                    name="estimateBHP.gaugeDepth.value"
                    title="Length"
                    width={120}
                  />
                  <div className="cogs-input-container">
                    <div className="title">Unit</div>
                    <Field
                      as={Select}
                      name="estimateBHP.gaugeDepth.unit"
                      options={lengthUnitOptions}
                      value={lengthUnitOptions.find(
                        (option) =>
                          option.value === values.estimateBHP.gaugeDepth?.unit
                      )}
                      closeMenuOnSelect
                      onChange={({ value }: OptionType<string>) => {
                        setFieldValue('estimateBHP.gaugeDepth.unit', value);
                      }}
                    />
                  </div>
                </>
              ) : null}
            </FormRowStacked>
          ) : null}

          <FormHeader>Root finding</FormHeader>
          <FormRowStacked>
            <div className="cogs-input-container">
              <div className="title">Main solution</div>
              <Field
                as={Select}
                name="rootFindingSettings.mainSolution"
                options={rootFindingSolutionOptions}
                value={rootFindingSolutionOptions.find(
                  (option) =>
                    option.value === values.rootFindingSettings.mainSolution
                )}
                closeMenuOnSelect
                onChange={({ value }: OptionType<string>) => {
                  setFieldValue('rootFindingSettings.mainSolution', value);
                }}
              />
            </div>
            <NumberField
              min={0}
              name="rootFindingSettings.rootTolerance"
              title="Tolerance"
              width={120}
            />
            <NumberField
              min={0}
              name="rootFindingSettings.bracket.lowerBound"
              title="Lower bound"
              width={120}
            />
            <NumberField
              name="rootFindingSettings.bracket.upperBound"
              title="Upper bound"
              width={120}
            />
          </FormRowStacked>
        </>
      )}
    </FormContainer>
  );
}
