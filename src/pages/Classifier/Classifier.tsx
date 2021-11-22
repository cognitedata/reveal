import React from 'react';
import { classifierConfig } from 'configs';
import { ClassifierState } from 'machines/classifier/types';
import { Loader } from '@cognite/cogs.js';
import useValidatePipelineName from 'hooks/useValidatePipelineName';
import { StepWidget } from './components/widgets';
import { ClassifierRouter } from './pages';

const ClassifierPage: React.FC = () => {
  const [isLoading] = useValidatePipelineName();
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

  if (isLoading) {
    return <Loader darkMode />;
  }

  return <ClassifierRouter Widget={renderStepsWidget} />;
};

export default ClassifierPage;
