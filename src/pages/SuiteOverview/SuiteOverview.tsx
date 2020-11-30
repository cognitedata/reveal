import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Loader, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { Tile } from 'components/tiles';
import { TilesContainer, OverviewContainer } from 'styles/common';
import {
  getDashboarsdBySuite,
  getSuitesTableState,
} from 'store/suites/selectors';
import { useSelector } from 'react-redux';
import { Suite } from 'store/suites/types';
import { StyledTitle } from './elements';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
  const { title, dashboards } = suite || {};

  const Header = () => {
    return (
      <>
        <SuiteAvatar color="#C8F4E7" title="Product Optimization" />
        <Title as={StyledTitle} level={5}>
          {title}
        </Title>
        <Button variant="ghost" icon="MoreOverflowEllipsisHorizontal" />
      </>
    );
  };
  return (
    <>
      <Suitebar leftCustomHeader={<Header />} />
      <OverviewContainer>
        <TilesContainer>
          <Title level={6}>All dashboards</Title>
          {dashboards?.map((dashboard) => (
            // eslint-disable-next-line
            // TODO pass item
            <Tile
              key={dashboard.key}
              view="board"
              title={dashboard.title}
              description={dashboard.type}
              embedTag={dashboard.embedTag}
            />
          ))}
        </TilesContainer>
        <div>I am inside suite {id}</div>
      </OverviewContainer>
    </>
  );
};

export default SuiteOverview;
