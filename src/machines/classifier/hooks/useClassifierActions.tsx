import { ClassifierState } from 'src/machines/classifier/types';
import { useClassifierContext } from '../contexts/ClassifierContext';

export const useClassifierActions = () => {
  const { classifierMachine } = useClassifierContext();

  const nextPage = () => classifierMachine.send('NEXT');
  const previousPage = () => classifierMachine.send('PREVIOUS');

  const updateDescription = (description: {
    [x in ClassifierState]?: string;
  }) => classifierMachine.send('updateDescription', { payload: description });

  const setClassifierId = (id?: number) =>
    classifierMachine.send('setClassifierId', { payload: id });

  return {
    nextPage,
    previousPage,
    updateDescription,
    setClassifierId,
  };
};
