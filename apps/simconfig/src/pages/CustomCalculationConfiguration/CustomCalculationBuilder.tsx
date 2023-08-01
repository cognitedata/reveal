import { useEffect, useState } from 'react';
import { useNavigate } from 'react-location';

import { Editor } from '@simint-app/components/shared/Editor';
import { Wizard } from '@simint-app/components/shared/Wizard';
import { useUserInfo } from '@simint-app/hooks/useUserInfo';
import { DataSamplingStep } from '@simint-app/pages/CalculationConfiguration/steps/DataSamplingStep';
import { ScheduleStep } from '@simint-app/pages/CalculationConfiguration/steps/ScheduleStep';
import { SummaryStep } from '@simint-app/pages/CalculationConfiguration/steps/SummaryStep';
import { createCdfLink } from '@simint-app/utils/createCdfLink';
import { Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Infobox, Switch, toast } from '@cognite/cogs.js';
import { useUpsertCalculationMutation } from '@cognite/simconfig-api-sdk/rtk';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { CustomCalculationBuilderContainer } from './elements';
import { Routine } from './Routine';
import { getStepValidationErrors } from './Routine/validation';

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
  const navigate = useNavigate();
  const [isCalculationFormatValid, setIsCalculationFormatValid] =
    useState<boolean>(true);
  const [calculationTemp, setCalculationTemp] = useState<string>();
  const [isEditorEnabled, setIsEditorEnabled] = useState<boolean>(false);
  const [editorChangesSaved, setEditorChangesSaved] = useState<boolean>(true);
  const { data: user } = useUserInfo();
  const [upsertCalculation] = useUpsertCalculationMutation();

  useEffect(() => {
    setCalculationTemp(JSON.stringify(calculation, null, 2));
  }, [calculation]);

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
    if (calculationConfiguration) {
      const checkCalc = isValidCalculation(calculationConfiguration);
      setIsCalculationFormatValid(!!checkCalc);

      if (checkCalc) {
        const update = {
          ...(JSON.parse(calculationConfiguration) as UserDefined),
          userEmail: user?.mail ?? '',
        };
        setCalculation(update);
        setValues(update);
      }
    }
  };

  return (
    <CustomCalculationBuilderContainer>
      <Formik
        initialValues={calculation}
        validateOnChange={false}
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
                to: createCdfLink(
                  `/model-library/models/${simulator}/${modelName}/calculations`
                ),
              });
            })
            .catch((error) =>
              toast.error(
                `An error occured while storing the calculation configuration. Error: ${error}`
              )
            );
        }}
      >
        {({ isSubmitting, isValid, values, setValues, submitForm }) => (
          <Form>
            <CustomCalculationConfigurationHeader>
              <strong>{values.calculationName} </strong>
              Configuration for {decodeURI(modelName)}
            </CustomCalculationConfigurationHeader>
            <Wizard
              isSubmitting={isSubmitting}
              isValid={isValid}
              animated
              onChangeStep={() => {
                if (!editorChangesSaved && calculationTemp) {
                  const val = JSON.parse(calculationTemp) as UserDefined;
                  setCalculation(val);
                  setValues(val);
                  setEditorChangesSaved(true);
                } else {
                  setCalculation(values);
                  setValues(values);
                }
                return true;
              }}
              onSubmit={submitForm}
            >
              <Wizard.Step
                disabled={!isCalculationFormatValid}
                icon="Calendar"
                key="schedule"
                title="Schedule"
                validationErrors={getStepValidationErrors(values, 'schedule')}
              >
                <ScheduleStep />
              </Wizard.Step>

              <Wizard.Step
                disabled={!isCalculationFormatValid}
                icon="DataSource"
                key="data-sampling"
                title="Data sampling"
                validationErrors={getStepValidationErrors(
                  values,
                  'dataSampling',
                  'logicalCheck',
                  'steadyStateDetection'
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
                <Switch
                  checked={isEditorEnabled}
                  className="routine-editor-switch"
                  name="routine-editor-switch"
                  style={{ marginBottom: '1em' }}
                  onChange={(
                    _e: React.ChangeEvent<HTMLInputElement>,
                    value: boolean
                  ) => {
                    setIsEditorEnabled(value);
                  }}
                >
                  {!isEditorEnabled
                    ? 'Switch to JSON editor'
                    : 'Switch to routine builder'}
                </Switch>
                {isEditorEnabled ? (
                  <EditorContainer>
                    {!isCalculationFormatValid && (
                      <Infobox style={{ width: '600px' }} type="danger">
                        You entered an invalid value that is not supported.
                        Please try again.
                      </Infobox>
                    )}
                    <Editor
                      height="42vh"
                      value={calculationTemp}
                      width="90vw"
                      onChange={(value) => {
                        const checkCalc = isValidCalculation(value);
                        setIsCalculationFormatValid(!!checkCalc);
                        setCalculationTemp(value);
                        setEditorChangesSaved(false);
                        handleCalculationEditorChange(value, setValues);
                      }}
                    />
                  </EditorContainer>
                ) : (
                  <Routine setCalculation={setCalculation} />
                )}
              </Wizard.Step>

              <Wizard.Step
                disabled={!isCalculationFormatValid}
                icon="Checkmark"
                key="summary"
                title="Summary"
              >
                <SummaryStep />
              </Wizard.Step>
            </Wizard>
          </Form>
        )}
      </Formik>
    </CustomCalculationBuilderContainer>
  );
}

const CustomCalculationConfigurationHeader = styled.div`
  margin-top: 2.69em;
  font-size: 1.5rem;
  z-index: 3;
  position: fixed;
  width: calc(100% - 3rem);
  backdrop-filter: blur(5px);
  padding: 0.25rem 0;
  padding-top: 2rem;
  padding-bottom: 3.5rem;
  font-size: 1.5em;
  background: rgba(255, 255, 255, 0.9);
  top: 3.5rem;
`;

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
`;
