import React, { FC } from 'react';

import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { classifierConfig } from 'configs';
import { ClassifierState } from 'machines/classifier/types';
import { Page } from 'components/Page';
import { BottomNavigation } from './components/navigations/BottomNavigation';
import { Step } from './components/step';
import { ClassifierRouter } from './pages';

const ClassifierPage: FC = () => {
  const { steps } = classifierConfig();

  const { nextPage, previousPage } = useClassifierActions();

  const renderStepsWidget = () => {
    return Object.keys(steps).map((step, index) => (
      <Step
        key={step}
        step={step as Exclude<ClassifierState, 'complete'>}
        index={index}
      />
    ));
  };

  return (
    <>
      <Page Widget={renderStepsWidget()}>
        <ClassifierRouter />
      </Page>

      <BottomNavigation onBackClick={previousPage} onNextClick={nextPage} />
    </>
  );
};

export default ClassifierPage;
