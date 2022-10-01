import { useState } from 'react';
import { useNavigate } from 'react-location';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Switch, toast } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';
import { useUpsertCalculationMutation } from '@cognite/simconfig-api-sdk/rtk';

import { Editor } from 'components/shared/Editor';
import { Wizard } from 'components/shared/Wizard';
import { DataSamplingStep } from 'pages/CalculationConfiguration/steps/DataSamplingStep';
import { ScheduleStep } from 'pages/CalculationConfiguration/steps/ScheduleStep';
import { SummaryStep } from 'pages/CalculationConfiguration/steps/SummaryStep';

import { CustomCalculationBuilderContainer } from './elements';
import { Routine } from './Routine';
import {
  getStepValidationErrors,
  userDefinedCalculationSchema,
} from './Routine/validation';

interface CustomCalculationBuilderProps {
  calculation: UserDefined;
  setCalculation: (calculation: UserDefined) => void;
  project: string;
  dataSetId: number;
  modelName: string;
  simulator: string;
}

export function CustomCalculationBuilder({
  calculation,
  setCalculation,
  project,
  dataSetId,
  modelName,
  simulator,
}: CustomCalculationBuilderProps) {
  const [isJsonModeEnabled, setJsonModeEnabled] = useState<boolean>(false);
  const navigate = useNavigate();
  const { authState } = useAuthContext();
  const [upsertCalculation] = useUpsertCalculationMutation();

  function isValidCalculation(str: string): UserDefined | boolean {
    try {
      return JSON.parse(str) as UserDefined;
    } catch (e) {
      return false;
    }
  }

  const handleCalculationEditorChange = (
    calculationConfiguration: string | undefined,
    setValues: (values: UserDefined) => void
  ) => {
    if (
      calculationConfiguration &&
      isValidCalculation(calculationConfiguration)
    ) {
      const update = {
        ...(JSON.parse(calculationConfiguration) as UserDefined),
        userEmail: authState?.email ?? '',
      };
      setCalculation(update);
      setValues(update);
    }
  };

  return (
    <CustomCalculationBuilderContainer>
      <Formik
        initialValues={calculation}
        validateOnChange={false}
        validationSchema={userDefinedCalculationSchema}
        validateOnBlur
        validateOnMount
        onSubmit={async (_values) => {
          await upsertCalculation({
            project,
            dataSetId,
            calculationTemplateModel: calculation,
          })
            .unwrap()
            .then((_payload) => {
              toast.success('The calculation was successfully configured.', {
                autoClose: 5000,
              });

              navigate({
                to: `/model-library/models/${simulator}/${modelName}/calculations`,
              });
            })
            .catch((error) =>
              toast.error(
                `An error occured while storing the calculation configuration. Error: ${error}`
              )
            );
        }}
      >
        {({
          isSubmitting,
          isValid,
          values,
          setValues,
          submitForm,
          setFieldValue,
        }) => (
          <Form>
            <CustomCalculationConfigurationHeader>
              <Field
                name="calculationName"
                size={values.calculationName.length - 5}
                value={values.calculationName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const { name, value } = event.target;
                  setFieldValue(name, value);
                  setCalculation({ ...calculation, calculationName: value });
                }}
              />
              Configuration for {modelName}
            </CustomCalculationConfigurationHeader>
            <Wizard
              isSubmitting={isSubmitting}
              isValid={isValid}
              animated
              onChangeStep={() => {
                setCalculation(values);
                setValues(values);
                return true;
              }}
              onSubmit={submitForm}
            >
              <Wizard.Step
                icon="Calendar"
                key="schedule"
                title="Schedule"
                validationErrors={getStepValidationErrors(values, 'schedule')}
              >
                <ScheduleStep />
              </Wizard.Step>

              <Wizard.Step
                icon="DataSource"
                key="data-sampling"
                title="Data sampling"
                validationErrors={getStepValidationErrors(
                  values,
                  'dataSampling'
                )}
              >
                <DataSamplingStep />
              </Wizard.Step>

              <Wizard.Step
                icon="Function"
                key="routine"
                title="Routine"
                validationErrors={getStepValidationErrors(values, 'routine')}
              >
                <Routine setCalculation={setCalculation} />
              </Wizard.Step>

              <Wizard.Step icon="Checkmark" key="summary" title="Summary">
                <Switch
                  checked={isJsonModeEnabled}
                  name="json-preview"
                  onChange={() => {
                    setJsonModeEnabled(!isJsonModeEnabled);
                  }}
                >
                  JSON Preview
                </Switch>
                {isJsonModeEnabled ? (
                  <Editor
                    height="55vh"
                    value={JSON.stringify(calculation, null, 2)}
                    onChange={(value) => {
                      handleCalculationEditorChange(value, setValues);
                    }}
                  />
                ) : (
                  <SummaryStep />
                )}
              </Wizard.Step>
            </Wizard>
          </Form>
        )}
      </Formik>
    </CustomCalculationBuilderContainer>
  );
}

const CustomCalculationConfigurationHeader = styled.div`
  font-size: 1.5rem;
  z-index: 3;
  position: fixed;
  width: calc(100% - 3rem);
  backdrop-filter: blur(5px);
  padding: 2rem 0;
  font-size: 1.5em;
  background: rgba(255, 255, 255, 0.9);
  top: 3.5rem;
  input {
    border: none;
    background-color: inherit;
    font-weight: 700;
    min-width: 200px;
    cursor: text;
    &:focus,
    &:hover {
      outline: none;
      background-color: rgba(217, 217, 217, 0.45);
      border-bottom: 0.05px solid rgba(217, 217, 217, 1);
    }
  }
`;
