import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Graphic, Loader, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { Tile } from 'components/tiles';
import { AddDashboardModal } from 'components/modals';
import { TilesContainer, OverviewContainer } from 'styles/common';
import {
  getDashboarsdBySuite,
  getSuitesTableState,
} from 'store/suites/selectors';
import { useSelector } from 'react-redux';
import { Dashboard, Suite } from 'store/suites/types';
import { StyledTitle, NoDashboardsContainer } from './elements';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const { loading: suitesLoading, loaded: suitesLoaded } = useSelector(
    getSuitesTableState
  );

  const suite: Suite = useSelector(getDashboarsdBySuite(id)) as Suite;

  if (!suitesLoaded) {
    return null;
  }

  if (suitesLoading) {
    return <Loader />;
  }

  if (!suite) {
    history.push('/');
  }
  const { title, color, dashboards } = suite || {};

  const Header = () => {
    return (
      <>
        <SuiteAvatar color={color} title={title} />
        <Title as={StyledTitle} level={5}>
          {title}
        </Title>
        <Button variant="ghost" icon="MoreOverflowEllipsisHorizontal" />
      </>
    );
  };
  return (
    <>
      <Suitebar
        leftCustomHeader={<Header />}
        actionButton={<AddDashboardModal buttonText="Add dashboard" />}
      />
      <OverviewContainer>
        <TilesContainer>
          {!dashboards?.length ? (
            <NoDashboardsContainer>
              <Graphic type="DataKits" />
              <Title level={5}>No dasboards added to suite yet</Title>
            </NoDashboardsContainer>
          ) : (
            <>
              <Title level={6}>All dashboards</Title>
              {dashboards?.map((dashboard: Dashboard) => (
                <a
                  key={dashboard.key}
                  href={dashboard.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Tile dataItem={dashboard} color={color} view="board" />
                </a>
              ))}
            </>
          )}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default SuiteOverview;
