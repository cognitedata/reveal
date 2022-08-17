import { useState } from 'react';

import { Form, Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';

import { Button, Collapse, Icon, Switch } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import type {
  CalculationProcedure,
  CalculationStep,
  CalculationTemplate,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { Editor } from 'components/shared/Editor';
import { Wizard } from 'components/shared/Wizard';
import { DataSamplingStep } from 'pages/CalculationConfiguration/steps/DataSamplingStep';
import { ScheduleStep } from 'pages/CalculationConfiguration/steps/ScheduleStep';
import { SummaryStep } from 'pages/CalculationConfiguration/steps/SummaryStep';

import {
  CollapseHeaderContainer,
  CustomCalculationBuilderContainer,
} from './elements';

interface ProcedureCollapseHeaderProps {
  procedure: CalculationProcedure;
  handleDeleteGroup: (procedure: CalculationProcedure) => void;
}

function ProcedureCollapseHeader({
  procedure,
  handleDeleteGroup,
}: ProcedureCollapseHeaderProps) {
  return (
    <CollapseHeaderContainer>
      <div className="left-options">
        <span>{procedure.order}</span>
        <span>{procedure.description}</span>
        <Icon type="Edit" />
      </div>
      <div className="right-options">
        <Icon className="drag-element" type="DragHandleVertical" />
        <Icon
          type="Delete"
          onClick={() => {
            handleDeleteGroup(procedure);
          }}
        />
      </div>
    </CollapseHeaderContainer>
  );
}

function StepCollapseHeader({ step }: { step: CalculationStep }) {
  return (
    <CollapseHeaderContainer>
      <div className="left-options">
        <span>
          {step.type} ({step.arguments.address}, {step.arguments.value})
        </span>
      </div>
      <div className="right-options">
        <Icon className="drag-element" type="DragHandleVertical" />
        <Icon type="Delete" />
      </div>
    </CollapseHeaderContainer>
  );
}

function isJSON(str: string) {
  try {
    return JSON.parse(str) && !!str;
  } catch (e) {
    return false;
  }
}

interface CustomCalculationBuilderProps {
  calculation: UserDefined;
  setCalculation: (calculation: CalculationTemplate) => void;
}

export function CustomCalculationBuilder({
  calculation,
  setCalculation,
}: CustomCalculationBuilderProps) {
  const [isJsonModeEnabled, setJsonModeEnabled] = useState<boolean>(false);
  const { authState } = useAuthContext();

  const handleCalculationEditorChange = (
    calculationConfiguration: string | undefined
  ) => {
    if (calculationConfiguration && isJSON(calculationConfiguration)) {
      const configuration: CalculationTemplate = JSON.parse(
        calculationConfiguration
      ) as CalculationTemplate;
      setCalculation({ ...configuration, userEmail: authState?.email ?? '' });
    }
  };

  const handleNewGroup = () => {
    if (calculation.routine) {
      const groupsLength = calculation.routine.length;
      const nextGroupOrderNumber =
        groupsLength > 0 ? calculation.routine[groupsLength - 1].order + 1 : 0;
      const newGroup: CalculationProcedure = {
        order: nextGroupOrderNumber,
        description: 'New group sample',
        steps: [] as CalculationStep[],
      };
      setCalculation({
        ...calculation,
        routine: [...calculation.routine, newGroup],
      });
    }
  };

  const handleDeleteGroup = (procedure: CalculationProcedure) => {
    if (calculation.routine) {
      const routine = calculation.routine
        .filter((routine) => routine.order !== procedure.order)
        .map((routine, index) => ({ ...routine, order: index + 1 }));
      setCalculation({ ...calculation, routine });
    }
  };

  const handleNewStep = (procedure: CalculationProcedure) => {
    const stepsLength = procedure.steps.length;
    const stepNumber =
      stepsLength > 0 ? procedure.steps[stepsLength - 1].step + 1 : 0;
    const newStep: CalculationStep = {
      step: stepNumber,
      type: 'DoSet',
      arguments: {
        address: '',
      },
    };
    const routine = cloneDeep(calculation.routine ?? []);
    routine[procedure.order - 1] = {
      ...procedure,
      steps: [...procedure.steps, newStep],
    };
    setCalculation({ ...calculation, routine });
  };

  if (!Object.keys(calculation).length) {
    return null;
  }

  return (
    <CustomCalculationBuilderContainer>
      <Formik
        initialValues={calculation}
        validateOnChange={false}
        validateOnBlur
        validateOnMount
        onSubmit={() => {
          console.log('ok');
        }}
      >
        {({ submitForm, isSubmitting, isValid, values, setValues }) => (
          <Form>
            <Wizard
              isSubmitting={isSubmitting}
              isValid={isValid}
              animated
              onChange={() => {
                setCalculation(values);
                setValues(values);
                return true;
              }}
              onChangeStep={() => {
                setCalculation(values);
                setValues(values);
                return true;
              }}
            >
              <Wizard.Step icon="Calendar" key="schedule" title="Schedule">
                <ScheduleStep />
              </Wizard.Step>

              <Wizard.Step
                icon="DataSource"
                key="data-sampling"
                title="Data sampling"
              >
                <DataSamplingStep />
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
                    height="45vh"
                    mode="json"
                    value={JSON.stringify(calculation, null, 2)}
                    onChange={handleCalculationEditorChange}
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
