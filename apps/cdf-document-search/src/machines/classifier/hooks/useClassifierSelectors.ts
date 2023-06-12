import { useSelector } from '@xstate/react';

import { classifierConfig } from '../../../configs';
import { StepProps } from '../../../pages/Classifier/components/widgets/types';
import { useClassifierContext } from '../contexts/ClassifierContext';
import { ClassifierState } from '../types';

export const useClassifierStatus = (): { [x: string]: 'done' | 'failed' } => {
  const { classifierMachine } = useClassifierContext();

  // @ts-ignore
  return useSelector(classifierMachine, (store) => store.context.status);
};

export const useClassifierDescription = () => {
  const { classifierMachine } = useClassifierContext();

  // @ts-ignore
  return useSelector(classifierMachine, (store) => store.context.description);
};

export const useClassifierId = () => {
  const { classifierMachine } = useClassifierContext();

  return useSelector(
    classifierMachine,
    (store: { context: { classifierId: any } }) => store.context.classifierId
  );
};

export const useClassifierCurrentState = () => {
  const { classifierMachine } = useClassifierContext();

  return useSelector(classifierMachine, (machineState: { value: any }) => {
    return machineState.value;
  });
};

export const useClassifierCurrentStep = (step: ClassifierState): boolean => {
  const classifierState = useClassifierCurrentState();

  return classifierState === step;
};

export const useClassifierConfig = (
  step: Exclude<ClassifierState, 'complete'>
): StepProps => {
  return classifierConfig().steps[step];
};
