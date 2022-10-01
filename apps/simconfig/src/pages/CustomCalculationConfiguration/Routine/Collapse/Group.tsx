/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';

import { Field, useFormikContext } from 'formik';
import { useDragControls } from 'framer-motion';
import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';
import type {
  CalculationProcedure,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { CollapseOptions } from './CollapseOptions';

import type { DragControls } from 'framer-motion';

interface GroupProps {
  procedure: CalculationProcedure;
  updateDragControls: (idx: string, dragControl: DragControls) => void;
  groupOrder: number;
}

export function Group({
  procedure,
  children,
  updateDragControls,
  groupOrder,
}: React.PropsWithChildren<GroupProps>) {
  const { setValues, setFieldValue, values } = useFormikContext<UserDefined>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const controls = useDragControls();
  const dragControlKey = procedure.order.toString();

  useEffect(() => {
    updateDragControls(dragControlKey, controls);
  }, []);

  const handleDeleteGroup = (procedure: CalculationProcedure) => {
    if (values.routine) {
      const routine = values.routine
        .filter((routine) => routine.order !== procedure.order)
        .map((routine, index) => ({ ...routine, order: index + 1 }));
      setValues((prevState) => ({ ...prevState, routine }));
    }
  };

  return (
    <CollapseStepContainer>
      <div
        className="step-group"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <div className="group-title">
          <Icon type={`${isOpen ? 'ChevronUp' : 'ChevronDown'}`} />
          <span className="procedure-order">{groupOrder + 1}</span>
          <Field
            className="group-description-input"
            name={`routine.${procedure.order - 1}.description`}
            size={procedure.description.length - 5}
            spellCheck={false}
            value={procedure.description}
            autoFocus
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { name, value } = event.target;
              setFieldValue(name, value);
            }}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}
          />
        </div>

        <CollapseOptions
          controls={controls}
          handleDelete={() => {
            handleDeleteGroup(procedure);
          }}
        />
      </div>
      <div className="group-content">{isOpen && children}</div>
    </CollapseStepContainer>
  );
}

const CollapseStepContainer = styled.div`
  margin-bottom: 8px;
  user-select: none;

  .step-group {
    width: 100%;
    border-radius: 8px;
    background-color: #f5f5f5;
    padding: 1em;
    color: #666666;
    align-items: center;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    .group-title {
      display: flex;
      align-items: center;
    }

    .group-edit-icon {
      margin-left: 12px;
    }

    .procedure-order {
      font-weight: 500;
      margin-right: 20px;
    }

    .cogs-icon {
      margin-right: 10px;
    }
  }
  .group-content {
    margin-top: 8px;
  }

  .group-description-input {
    border: none;
    background-color: inherit;
    min-width: 200px;
    width: 100%;
    padding: 0;
    padding-left: 0.1rem;
    margin: 0;
    transition: background-color 0.1s;
    &:hover,
    &:focus {
      background-color: rgba(217, 217, 217, 0.45);
    }
    &:focus {
      outline: none;
      border-bottom: 0.05px solid rgba(217, 217, 217, 1);
    }
  }
`;
