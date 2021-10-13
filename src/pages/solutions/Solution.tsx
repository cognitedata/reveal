import { lazy, Suspense } from 'react';
import styled from 'styled-components/macro';
import { Tabs, Title } from '@cognite/cogs.js';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { solutions } from '../../mocks/solutions';
import { Spinner } from '../../components/Spinner/Spinner';

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

const IntegrationsPage = lazy(() =>
  import('./Tabs/IntegrationsPage').then((module) => ({
    default: module.IntegrationsPage,
  }))
);

const VersionsPage = lazy(() =>
  import('./Tabs/VersionsPage').then((module) => ({
    default: module.VersionsPage,
  }))
);

const SettingsPage = lazy(() =>
  import('./Tabs/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);

type TabKeys =
  | 'overview'
  | 'data_model'
  | 'integrations'
  | 'versions'
  | 'settings';

export const Solution = () => {
  const { solutionId, tabKey } = useParams<{
    solutionId: string;
    tabKey: string;
  }>();
  const history = useHistory();

  const onNavigate = (tab: TabKeys) => {
    history.push({
      pathname: `/solutions/${solutionId}/${tab}`,
    });
  };

  return (
    <StyledPage>
      <StyledHeader>
        <Title level={3} style={{ marginBottom: '1rem' }}>
          {solutions.find((s) => s.id.toString() === solutionId)?.name}
        </Title>
        <Tabs
          onChange={(key) => onNavigate(key as TabKeys)}
          defaultActiveKey={tabKey}
        >
          <Tabs.TabPane key="overview" tab="Overview" />
          <Tabs.TabPane key="data_model" tab="Data model" />
          <Tabs.TabPane key="integrations" tab="Integrations" />
          <Tabs.TabPane key="versions" tab="Versions" />
          <Tabs.TabPane key="settings" tab="Settings" />
        </Tabs>
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
          <Route exact path="/solutions/:solutionId?/data_model">
            <Suspense fallback={<Spinner />}>
              <DataModelPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/integrations">
            <Suspense fallback={<Spinner />}>
              <IntegrationsPage />
            </Suspense>
          </Route>
          <Route exact path="/solutions/:solutionId?/versions">
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
    </StyledPage>
  );
};

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

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
`;
