import React from 'react';
import { classifierConfig } from 'src/configs';
import { ClassifierState } from 'src/machines/classifier/types';
import { StepWidget } from './components/widgets';
import { ClassifierRouter } from './pages';

const ClassifierPage: React.FC = () => {
  const { steps } = classifierConfig();

  const renderStepsWidget = () => {
    return Object.keys(steps).map((step, index) => (
      <StepWidget
        key={step}
        step={step as Exclude<ClassifierState, 'complete'>}
        index={index}
      />
    ));
  };

  return <ClassifierRouter Widget={renderStepsWidget} />;
};

export default ClassifierPage;
