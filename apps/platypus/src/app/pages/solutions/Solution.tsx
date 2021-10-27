import { lazy, Suspense } from 'react';
import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';
import { Route, Switch, useParams } from 'react-router-dom';
import { solutions } from '../../mocks/solutions';
import { Spinner } from '../../components/Spinner/Spinner';
import { StyledPageWrapper } from '../styles/SharedStyles';

const OverviewPage = lazy(() =>
  import('./Tabs/OverviewPage').then((module) => ({
    default: module.OverviewPage,
  }))
);

const DataModelPage = lazy(() =>
  import('./Tabs/DataModelPage').then((module) => ({
    default: module.DataModelPage,
  }))
);

const DevelopmentToolsPage = lazy(() =>
  import('./Tabs/DevelopmentToolsPage').then((module) => ({
    default: module.DevelopmentToolsPage,
  }))
);

const VersionsPage = lazy(() =>
  import('./Tabs/DeploymentsPage').then((module) => ({
    default: module.VersionsPage,
  }))
);

const SettingsPage = lazy(() =>
  import('./Tabs/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);

export const Solution = () => {
  const { solutionId } = useParams<{
    solutionId: string;
  }>();

  return (
    <StyledPageWrapper>
      <StyledHeader>
        <Title level={3} style={{ marginBottom: '1rem' }}>
          {solutions.find((s) => s.id.toString() === solutionId)?.name}
        </Title>
      </StyledHeader>
      <StyledContent>
        <Switch>
          <Route
            exact
            path={[
              '/solutions/:solutionId?',
              '/solutions/:solutionId?/overview',
            ]}
          >
            <Suspense fallback={<Spinner />}>
              <OverviewPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/data-model">
            <Suspense fallback={<Spinner />}>
              <DataModelPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/development-tools">
            <Suspense fallback={<Spinner />}>
              <DevelopmentToolsPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/deployments">
            <Suspense fallback={<Spinner />}>
              <VersionsPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/settings">
            <Suspense fallback={<Spinner />}>
              <SettingsPage />
            </Suspense>
          </Route>
        </Switch>
      </StyledContent>
    </StyledPageWrapper>
  );
};

const StyledHeader = styled.div`
  width: 100%;
  flex: 0;
`;

const StyledContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  font-size: 3rem;
  overflow: auto;
  position: relative;
`;
