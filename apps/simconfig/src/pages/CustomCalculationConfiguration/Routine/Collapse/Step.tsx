/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';
import { useDragControls } from 'framer-motion';
import cloneDeep from 'lodash/cloneDeep';
import styled from 'styled-components/macro';

import { Icon, Label } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { StepCommand } from '../Commands/StepCommand';
import type { StepCommandProps } from '../Commands/utils';
import { isValidStep } from '../validation';

import { CollapseOptions } from './CollapseOptions';

export function Step({
  routineOrder,
  routineIndex,
  step,
  index,
  updateDragControls,
}: Omit<StepCommandProps, 'stepIndex'>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const controls = useDragControls();
  const stepPosition = `${routineIndex ?? 0}.${(index ?? 0) + 1}`;
  const dragControlKey = `${routineOrder}.${step.step}`;
  const title = `${step.type} ( ${step.arguments.address}, ${
    step.arguments.value ?? ''
  })`;
  const { setValues, values } = useFormikContext<UserDefined>();

  useEffect(() => {
    if (updateDragControls) {
      updateDragControls(dragControlKey, controls);
    }
  }, []);

  const handleDeleteStep = (routineOrder: number, stepOrder: number) => {
    if (values.routine) {
      const routine = cloneDeep(values.routine);
      const stepRoutine = routine[routineOrder - 1];
      stepRoutine.steps = stepRoutine.steps
        .filter((step) => step.step !== stepOrder)
        .map((step, index) => ({ ...step, step: index + 1 }));
      setValues((prevState) => ({ ...prevState, routine }));
    }
  };

  return (
    <CollapseStepContainer>
      <div className="step-title">
        <div
          className="step-drop"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Icon type={`${isOpen ? 'ChevronUp' : 'ChevronDown'}`} />
          <span className="step-position">{stepPosition}</span>
          {title}
          {!isValidStep(step) && (
            <Label className="warning-label" size="small">
              Configuration incomplete
            </Label>
          )}
        </div>

        <CollapseOptions
          controls={controls}
          handleDelete={() => {
            handleDeleteStep(routineOrder, step.step);
          }}
        />
      </div>

      <div className="step-content">
        {isOpen && <StepCommand routineOrder={routineOrder} step={step} />}
      </div>
    </CollapseStepContainer>
  );
}

const CollapseStepContainer = styled.div`
  margin-bottom: 0.5em;
  margin-left: 1em;

  .step-content {
    &,
    * {
      background-color: #ffffff;
    }
  }

  .step-title {
    width: 100%;
    background-color: #f5f5f5;
    padding: 1em;
    color: #666666;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;

    .step-drop {
      cursor: pointer;
    }

    .step-position {
      font-weight: 500;
      margin-right: 20px;
    }

    .cogs-icon {
      margin-right: 10px;
    }

    .warning-label {
      cursor: pointer;
      border: 2px solid rgba(255, 187, 0, 0.2);
      border-radius: 4px;
      color: #b55800;
      font-size: 13px;
      font-weight: 500;
      background-color: transparent;
      margin-left: 1em;
    }
  }
`;
