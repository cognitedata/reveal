import {
  ClassifierState,
  StepProps,
} from 'pages/Classifier/components/step/types';

interface ClassifierConfig {
  steps: { [state in Exclude<ClassifierState, 'complete'>]: StepProps };
}

export const classifierConfig = (): ClassifierConfig => {
  return {
    steps: {
      [ClassifierState.MANAGE]: {
        title: 'Manage training sets',
        subtitleStyle: 'plain-text',
        subtitle: 'test',
        nextText: 'Next step',
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
