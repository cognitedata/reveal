import { StepProps } from 'src/pages/Classifier/components/widgets/types';
import { ClassifierState } from 'src/machines/classifier/types';

interface ClassifierConfig {
  steps: { [state in Exclude<ClassifierState, 'complete'>]: StepProps };
}

export const classifierConfig = (): ClassifierConfig => {
  return {
    steps: {
      [ClassifierState.MANAGE]: {
        title: 'Manage training sets',
        description:
          'Select the labels you want your classifier to use, and provide a training set of documents matching each of the labels',
      },
      [ClassifierState.TRAIN]: {
        title: 'Train classifier',
        description:
          'Please verify that the current setup is correct before training the classifier',
      },
      [ClassifierState.DEPLOY]: {
        title: 'Results/Deploy',
      },
    },
  };
};
