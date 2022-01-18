import { VerticalContainer } from 'src/modules/Common/Components/VerticalContainer';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import { ProcessFileDetailsContainer } from 'src/modules/Process/Containers/ProcesseFileDetailsContainer/ProcesseFileDetailsContainer';
import React, { useMemo } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { workflowRoutes, WorkflowStepKey } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';

type ProcessPageProps = RouteComponentProps<{ step: WorkflowStepKey }>;

const ProcessStep = (props: ProcessPageProps) => {
  const compRoute = useMemo(
    () => () => import('src/modules/Process/Containers/ProcessStep'),
    []
  );

  return <LazyWrapper routeProps={props} importFn={compRoute} />;
};

export default function Process({ location }: ProcessPageProps) {
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
                search: location.search,
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
