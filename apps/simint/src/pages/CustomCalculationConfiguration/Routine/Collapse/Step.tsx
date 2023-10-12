/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';
import { useDragControls } from 'framer-motion';
import styled from 'styled-components/macro';

import { Chip, Icon } from '@cognite/cogs.js';
import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { StepCommand } from '../Commands/StepCommand';
import type { StepCommandProps } from '../Commands/utils';
import { removeStepFromCalculation } from '../utils';
import { isValidStep } from '../validation';

import { CollapseOptions } from './CollapseOptions';

export function Step({
  dynamicStepFields,
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

  const title = `${step.type} ( ${Object.values(step.arguments).join(', ')})`;
  const { setValues, values } = useFormikContext<UserDefined>();

  useEffect(() => {
    if (updateDragControls) {
      updateDragControls(dragControlKey, controls);
    }
  }, []);

  const handleDeleteStep = (routineOrder: number, stepOrder: number) => {
    setValues(removeStepFromCalculation(values, routineOrder, stepOrder));
  };

  const treeItemLabel = `Step ${stepPosition}`;

  return (
    <CollapseStepContainer
      role="treeitem"
      aria-expanded={isOpen}
      aria-label={treeItemLabel}
    >
      <div className="step-title">
        <div
          className="step-drop"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Icon
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${treeItemLabel}`}
            type={`${isOpen ? 'ChevronUp' : 'ChevronDown'}`}
          />
          <span className="step-position">{stepPosition}</span>
          {title}
          {!isValidStep(step, dynamicStepFields) && (
            <Chip
              css={{ marginLeft: '1em' }}
              label="Configuration incomplete"
              size="x-small"
              type="warning"
            />
          )}
        </div>

        <CollapseOptions
          controls={controls}
          handleDelete={() => {
            handleDeleteStep(routineOrder, step.step);
          }}
          label={`Step ${stepPosition}`}
        />
      </div>

      {isOpen && (
        <StepCommand
          dynamicStepFields={dynamicStepFields}
          routineOrder={routineOrder}
          step={step}
        />
      )}
    </CollapseStepContainer>
  );
}

const CollapseStepContainer = styled.div`
  margin-bottom: 0.5em;
  margin-left: 1em;

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
  }
`;
