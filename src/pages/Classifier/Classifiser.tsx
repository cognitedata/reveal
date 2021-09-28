import React, { FC } from 'react';
import styled from 'styled-components';

import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { classifierConfig } from 'configs';
import { BottomNavigation } from './components/navigations/BottomNavigation';
import { Step } from './components/step';
import { ClassifierState } from './components/step/types';
import { Pages } from './pages';

const Container = styled.div`
  display: flex;
  padding: 2.5rem;
  gap: 1.5rem;
`;

const Content = styled.section`
  width: 100%;
  height: 100%;
`;

const Widgets = styled.aside`
  width: 20rem;
`;

const Classifier: FC = () => {
  const { steps } = classifierConfig();

  const { nextPage, previousPage } = useClassifierActions();

  return (
    <>
      <Container>
        <Widgets>
          {Object.keys(steps).map((step, index) => (
            <Step
              key={step}
              step={step as Exclude<ClassifierState, 'complete'>}
              index={index}
            />
          ))}
        </Widgets>

        <Content>
          <Pages />
        </Content>
      </Container>

      <BottomNavigation
        onBackClick={() => previousPage()}
        onNextClick={() => nextPage()}
      />
    </>
  );
};

export default Classifier;
