import { ClassifierState } from 'machines/classifier/types';
import { useClassifierContext } from '../contexts/ClassifierContext';

export const useClassifierActions = () => {
  const { classifierMachine } = useClassifierContext();

  const nextPage = () => classifierMachine.send('NEXT');
  const previousPage = () => classifierMachine.send('PREVIOUS');

  const updateDescription = (description: {
    payload: { [x in ClassifierState]?: string };
  }) => classifierMachine.send('updateDescription', description);

  return {
    nextPage,
    previousPage,
    updateDescription,
  };
};
