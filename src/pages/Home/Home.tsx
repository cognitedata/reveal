import React, { useContext, useEffect, useState } from 'react';
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
import {
  getLastVisitedBoards,
  getSuitesTableState,
  getLastVisitedSuitesMock,
} from 'store/suites/selectors';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { isAdmin } from 'store/groups/selectors';
import { sortByLastUpdated } from 'utils/suites';
import { getUserId } from 'store/auth/selectors';
import { UserSpaceState } from 'store/userSpace/types';
// TODO(DTC-222)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fetchUserSpaceCdf, fetchUserSpace } from 'store/userSpace/thunks';
import { getLastVisitedKeys, getUserSpace } from 'store/userSpace/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { ApiClientContext } from 'providers/ApiClientProvider';

const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('Home');
  const itemsToDisplay = 4;
  const dispatch = useDispatch<RootDispatcher>();
  const { loading: suitesLoading, loaded: suitesLoaded, suites } = useSelector(
    getSuitesTableState
  );
  const admin = useSelector(isAdmin);

  // TODO(DTC-222)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const apiClient = useContext(ApiClientContext);
  const {
    loaded: userSpaceLoaded,
    loading: userSpaceLoading,
    // TODO(DTC-167)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: userSpaceError,
  }: UserSpaceState = useSelector(getUserSpace);
  const [userSpaceLoadDispatched, setUserSpaceLoadDispatched] = useState(false);

  const lastVisitedKeys = useSelector(getLastVisitedKeys) || [];
  const lastVisitedBoards = useSelector(
    getLastVisitedBoards(lastVisitedKeys, itemsToDisplay)
  );
  // TODO(DTC-167) replace lastVisitedSuites with lastVisitedBoards; handle userSpaceError
  const lastVisitedSuites = useSelector(
    getLastVisitedSuitesMock(itemsToDisplay)
  );

  // TODO(DTC-222) fetch userSpace from api client
  const userId = useSelector(getUserId);
  const client = useContext(CdfClientContext);
  useEffect(() => {
    if (!userSpaceLoaded && !userSpaceLoading && !userSpaceLoadDispatched) {
      // dispatch(fetchUserSpace(apiClient))
      dispatch(fetchUserSpaceCdf(client, userId));
      setUserSpaceLoadDispatched(true);
    }
  }, [
    dispatch,
    /* apiClient, */ client,
    userSpaceLoaded,
    userSpaceLoading,
    userSpaceLoadDispatched,
    userId,
  ]);

  if (!suitesLoaded || !suites?.length) {
    return <Title level={3}>No suites loaded</Title>;
  }

  if (suitesLoading || userSpaceLoading) {
    return <Loader />;
  }

  // TODO(DTC-167)
  // eslint-disable-next-line no-console
  console.log('lastVisitedBoards', lastVisitedBoards);

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
        <TilesContainer>
          <Title level={6}>Quick Access</Title>
          {/* TODO(DTC-167) */}
          {lastVisitedSuites?.map((suite: Suite) => {
            return (
              <Link to={`/suites/${suite.key}`} key={suite.key}>
                <SmallTile dataItem={suite} />
              </Link>
            );
          })}
        </TilesContainer>
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
