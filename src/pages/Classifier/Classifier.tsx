import React from 'react';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { classifierConfig } from 'configs';
import { Page } from 'components/page/Page';
import { ClassifierState } from 'machines/classifier/types';
import { Loader } from '@cognite/cogs.js';
import useValidatePipelineName from 'hooks/useValidatePipelineName';
import { BottomNavigation } from './components/navigations/BottomNavigation';
import { StepWidget } from './components/widgets';
import { ClassifierRouter } from './pages';

const ClassifierPage: React.FC = () => {
  const [isLoading] = useValidatePipelineName();

  const { steps } = classifierConfig();
  const { nextPage, previousPage } = useClassifierActions();

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

  return (
    <Page
      Widget={renderStepsWidget()}
      BottomNavigation={
        <BottomNavigation onBackClick={previousPage} onNextClick={nextPage} />
      }
      breadcrumbs={[{ title: 'New classifier' }]}
    >
      <ClassifierRouter />
    </Page>
  );
};

export default ClassifierPage;
