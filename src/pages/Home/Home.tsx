import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader, Title, Button } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { MultiStepModal } from 'components/modals';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { useSelector } from 'react-redux';
import { Suite } from 'store/suites/types';
import { getSuitesTableState } from 'store/suites/selectors';
import { SmallTilesContainer } from './elements';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');
  const [activeModal, setActiveModal] = useState<string>('');

  const { loading: suitesLoading, loaded: suitesLoaded, suites } = useSelector(
    getSuitesTableState
  );

  if (!suitesLoaded || !suites?.length) {
    return <Title level={3}>No suites loaded</Title>;
  }

  if (suitesLoading) {
    return <Loader />;
  }

  const closeModal = () => {
    setActiveModal('');
  };

  return (
    <>
      <Suitebar
        headerText="Executive overview"
        actionButton={
          <Button
            variant="outline"
            type="secondary"
            icon="Plus"
            iconPlacement="left"
            onClick={() => setActiveModal('create')}
          >
            New suite
          </Button>
        }
      />
      <OverviewContainer>
        <SmallTilesContainer>
          <Title level={6}>Quick Access</Title>
          {suites?.map((suite: Suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <SmallTile title={suite.title} color={suite.color} />
              </Link>
            );
          })}
        </SmallTilesContainer>
        <TilesContainer>
          <Title level={6}>Pinned</Title>
          {suites?.map((suite: Suite) => {
            return (
              <Tile
                key={suite.key}
                linkTo={`/suites/${suite.key}`}
                dataItem={suite}
                avatar
              />
            );
          })}
        </TilesContainer>
        <TilesContainer>
          <Title level={6}>All suites</Title>
          {suites?.map((suite: Suite) => {
            return (
              <Tile
                key={suite.key}
                linkTo={`/suites/${suite.key}`}
                dataItem={suite}
                avatar
              />
            );
          })}
        </TilesContainer>
      </OverviewContainer>
      {activeModal === 'create' && (
        <MultiStepModal handleCloseModal={closeModal} mode="create" />
      )}
    </>
  );
};

export default Home;
