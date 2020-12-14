import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader, Title, Button } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { useSelector, useDispatch } from 'react-redux';
import { Suite } from 'store/suites/types';
import { getSuitesTableState } from 'store/suites/selectors';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { SmallTilesContainer } from './elements';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');
  const dispatch = useDispatch();
  const { loading: suitesLoading, loaded: suitesLoaded, suites } = useSelector(
    getSuitesTableState
  );

  if (!suitesLoaded || !suites?.length) {
    return <Title level={3}>No suites loaded</Title>;
  }

  if (suitesLoading) {
    return <Loader />;
  }

  const handleOpenModal = (modalType: ModalType) => {
    dispatch(modalOpen({ modalType }));
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
            onClick={() => handleOpenModal('CreateSuite')}
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
    </>
  );
};

export default Home;
