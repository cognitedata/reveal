import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Title } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { useSelector } from 'react-redux';
import { getSuitesTableState } from 'store/suites/selectors';
import { SmallTilesContainer } from './elements';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');

  const { loaded: suitesLoaded, suites } = useSelector(getSuitesTableState);

  if (!suitesLoaded || !suites?.length) {
    return <Title level={3}>No suites loaded</Title>;
  }

  return (
    <>
      <Suitebar buttonText="New suite" />
      <OverviewContainer>
        <SmallTilesContainer>
          <Title level={6}>Quick Access</Title>
          {suites?.map((suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <SmallTile title={suite.title} color={suite.color} />
              </Link>
            );
          })}
        </SmallTilesContainer>
        <TilesContainer>
          <Title level={6}>Pinned</Title>
          {suites?.map((suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <Tile title={suite.title} color={suite.color} avatar />
              </Link>
            );
          })}
        </TilesContainer>
        <TilesContainer>
          <Title level={6}>All suites</Title>
          {suites?.map((suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <Tile title={suite.title} color={suite.color} avatar />
              </Link>
            );
          })}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default Home;
