import { useSelector } from '@xstate/react';
import { classifierConfig } from 'src/configs';
import { useClassifierContext } from 'src/machines/classifier/contexts/ClassifierContext';
import { StepProps } from 'src/pages/Classifier/components/widgets/types';
import { ClassifierState } from 'src/machines/classifier/types';

export const useClassifierStatus = (): { [x: string]: 'done' | 'failed' } => {
  const { classifierMachine } = useClassifierContext();

  return useSelector(classifierMachine, (store) => store.context.status);
};

export const useClassifierDescription = () => {
  const { classifierMachine } = useClassifierContext();

  return useSelector(classifierMachine, (store) => store.context.description);
};

export const useClassifierId = () => {
  const { classifierMachine } = useClassifierContext();

  return useSelector(classifierMachine, (store) => store.context.classifierId);
};

export const useClassifierCurrentState = () => {
  const { classifierMachine } = useClassifierContext();

  const state = useSelector(classifierMachine!, (machineState) => {
    return machineState.value;
  });

  return state;
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
