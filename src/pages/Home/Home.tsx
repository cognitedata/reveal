import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Loader, Title, Button } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { SuiteMenu } from 'components/menus';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { Suite } from 'store/suites/types';
import { getLastVisited, getSuitesTableState } from 'store/suites/selectors';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { isAdmin } from 'store/groups/selectors';
import { sortByLastUpdated } from 'utils/suites';
import { SmallTilesContainer } from './elements';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');
  const itemsToDisplay = 4;
  const dispatch = useDispatch<RootDispatcher>();
  const { loading: suitesLoading, loaded: suitesLoaded, suites } = useSelector(
    getSuitesTableState
  );
  const admin = useSelector(isAdmin);
  // eslint-disable-next-line no-console
  console.log('isAdmin: %s', admin);

  const lastVisited = useSelector(getLastVisited(itemsToDisplay));

  if (!suitesLoaded || !suites?.length) {
    return <Title level={3}>No suites loaded</Title>;
  }

  if (suitesLoading) {
    return <Loader />;
  }

  const sortedSuites = sortByLastUpdated(suites);

  const handleOpenModal = (modalType: ModalType) => {
    dispatch(modalOpen({ modalType }));
  };

  return (
    <>
      <Suitebar
        headerText="Executive overview"
        actionButton={
          admin && (
            <Button
              variant="outline"
              type="secondary"
              icon="Plus"
              iconPlacement="left"
              onClick={() => handleOpenModal('CreateSuite')}
            >
              New suite
            </Button>
          )
        }
      />
      <OverviewContainer>
        <SmallTilesContainer>
          <Title level={6}>Quick Access</Title>
          {lastVisited?.map((suite: Suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <SmallTile dataItem={suite} />
              </Link>
            );
          })}
        </SmallTilesContainer>
        <TilesContainer>
          <Title level={6}>Pinned</Title>
          {/* TODO(DTC-179) Show pinned suites */}
          {suites?.slice(0, 4).map((suite: Suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <Tile
                  key={suite.key}
                  dataItem={suite}
                  menu={<SuiteMenu dataItem={suite} />}
                  avatar
                />
              </Link>
            );
          })}
        </TilesContainer>
        <TilesContainer>
          <Title level={6}>All suites</Title>
          {sortedSuites?.map((suite: Suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <Tile
                  key={suite.key}
                  dataItem={suite}
                  menu={<SuiteMenu dataItem={suite} />}
                  avatar
                />
              </Link>
            );
          })}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default Home;
