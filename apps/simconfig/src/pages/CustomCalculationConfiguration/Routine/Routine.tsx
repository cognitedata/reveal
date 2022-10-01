import { useEffect, useState } from 'react';

import { useFormikContext } from 'formik';
import { Reorder } from 'framer-motion';
import cloneDeep from 'lodash/cloneDeep';

import { Button } from '@cognite/cogs.js';
import type {
  CalculationProcedure,
  CalculationStep,
  UserDefined,
} from '@cognite/simconfig-api-sdk/rtk';

import { Group, Step } from './Collapse';
import { getRoutineIndex } from './Commands/utils';

import type { DragControls } from 'framer-motion';

export function Routine({
  setCalculation,
}: {
  setCalculation: (calculation: UserDefined) => void;
}) {
  const { values, setValues } = useFormikContext<UserDefined>();
  const [dragControls, setDragControls] =
    useState<Record<string, DragControls>>();

  useEffect(() => {
    setCalculation(values);
  }, [values, setCalculation]);

  const updateDragControls = (idx: string, dragControl: DragControls) => {
    setDragControls((prevControls) => ({
      ...prevControls,
      [idx]: dragControl,
    }));
  };

  const handleNewStep = (procedure: CalculationProcedure) => {
    const newStep: CalculationStep = {
      step: procedure.steps.length + 1,
      type: 'Set',
      arguments: {
        address: '',
        type: 'manual',
      },
    };
    if (values.routine) {
      const procedureIndex = values.routine.findIndex(
        (routine) => routine.order === procedure.order
      );
      const routine = cloneDeep(values.routine);
      routine[procedureIndex] = {
        ...procedure,
        steps: [...procedure.steps, newStep],
      };
      setValues((prevState) => ({ ...prevState, routine }));
    }
  };

  const handleNewGroup = () => {
    if (values.routine) {
      const newGroup: CalculationProcedure = {
        order: values.routine.length + 1,
        description: 'New group',
        steps: [],
      };
      setValues((prevState) => ({
        ...prevState,
        routine: [...(prevState.routine ?? []), newGroup],
      }));
    }
  };

  const sortSteps = (routineOrder: number, steps: CalculationStep[]) => {
    const routineIndex = getRoutineIndex(values, routineOrder);
    const routine = cloneDeep(values.routine ?? []);
    routine[routineIndex].steps = steps;
    setValues((prevState) => ({
      ...prevState,
      routine,
    }));
  };

  const sortGroups = (routine: CalculationProcedure[]) => {
    setValues((prevState) => ({
      ...prevState,
      routine,
    }));
  };

  return (
    <>
      <Reorder.Group
        as="div"
        axis="y"
        values={values.routine ?? []}
        onReorder={(groups) => {
          sortGroups(groups as CalculationProcedure[]);
        }}
      >
        {values.routine?.map((routine, groupIndex) => (
          <Reorder.Item
            as="div"
            dragControls={dragControls?.[`${routine.order}`]}
            dragListener={false}
            key={`${routine.order}-group-udc`}
            value={routine}
          >
            <Group
              groupOrder={groupIndex}
              procedure={routine}
              updateDragControls={updateDragControls}
            >
              <>
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={routine.steps}
                  onReorder={(steps: CalculationStep[]) => {
                    sortSteps(routine.order, steps);
                  }}
                >
                  {routine.steps.map((step, stepIndex) => (
                    <Reorder.Item
                      as="div"
                      dragControls={
                        dragControls?.[`${routine.order}.${step.step}`]
                      }
                      dragListener={false}
                      key={`${routine.order}-${step.step}`}
                      value={step}
                    >
                      <Step
                        index={stepIndex}
                        routineIndex={groupIndex + 1}
                        routineOrder={routine.order}
                        step={step}
                        updateDragControls={updateDragControls}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                <Button
                  className="step-button"
                  icon="Add"
                  size="small"
                  type="tertiary"
                  onClick={() => {
                    handleNewStep(routine);
                  }}
                >
                  Add new step
                </Button>
              </>
            </Group>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <Button icon="Add" type="tertiary" onClick={handleNewGroup}>
        Add new group
      </Button>
    </>
  );
}
