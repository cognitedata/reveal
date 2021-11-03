import { StepProps } from 'pages/Classifier/components/step/types';
import { ClassifierState } from 'machines/classifier/types';

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
        nextText: 'Next step',
        subtitleStyle: 'plain-text',
      },
      [ClassifierState.TRAIN]: {
        title: 'Train classifier',
        subtitleStyle: 'badge',
        subtitle: 'test 2',
        nextText: 'Results',
      },
      [ClassifierState.DEPLOY]: {
        title: 'Results/Deploy',
        nextText: 'Deploy classifier',
      },
    },
  };
};
