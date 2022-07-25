import { VerticalContainer } from 'src/modules/Common/Components/VerticalContainer';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import { ProcessFileDetailsContainer } from 'src/modules/Process/Containers/ProcesseFileDetailsContainer/ProcesseFileDetailsContainer';
import React, { useMemo } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';

const ProcessStep = () => {
  const compRoute = useMemo(
    () => () => import('src/modules/Process/Containers/ProcessStep'),
    []
  );

  return <LazyWrapper importFn={compRoute} />;
};

export default function Process() {
  const { search } = useLocation();
  return (
    <VerticalContainer>
      <StatusToolBar current="Contextualize Imagery Data" previous="explorer" />
      <MainContent>
        <MainContainer>
          <Switch>
            <Redirect
              from={workflowRoutes.upload}
              to={{
                key: workflowRoutes.process,
                pathname: workflowRoutes.process,
                search,
              }}
            />
            <Route
              key={workflowRoutes.process}
              path={workflowRoutes.process}
              exact
              component={ProcessStep}
            />
          </Switch>
        </MainContainer>
        <ProcessFileDetailsContainer />
      </MainContent>
    </VerticalContainer>
  );
}

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const MainContainer = styled.div`
  flex: 1;
  min-width: 900px; /* totally random, but mocks have one size for now */

  /* the same padding is used in SubAppWrapper but it's disabled to make bottom nav looking right */
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 40px;
  }
  display: flex;
  flex-direction: column;
  height: auto;
  box-sizing: content-box;
`;
