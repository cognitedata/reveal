import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Title, Button, Icon, Graphic } from '@cognite/cogs.js';
import Glider from 'react-glider';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { SuiteMenu } from 'components/menus';
import {
  TilesContainer,
  OverviewContainer,
  NoItemsContainer,
} from 'styles/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { Suite, Board } from 'store/suites/types';
import {
  getLastVisitedBoards,
  getSuitesTableState,
} from 'store/suites/selectors';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { getGroupsState, isAdmin } from 'store/groups/selectors';
import { UserSpaceState } from 'store/userSpace/types';
import { fetchUserSpace } from 'store/userSpace/thunks';
import { getLastVisited, getUserSpace } from 'store/userSpace/selectors';
import { ApiClientContext } from 'providers/ApiClientProvider';
import 'glider-js/glider.min.css';
import { useMetrics } from 'utils/metrics';

const Home = () => {
  const itemsToDisplay = 6;
  const glideItemWidth = 348;
  const dispatch = useDispatch<RootDispatcher>();
  const { loading: suitesLoading, loaded: suitesLoaded, suites } = useSelector(
    getSuitesTableState
  );
  const admin = useSelector(isAdmin);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const canEdit = admin && !groupsFilter?.length;

  const apiClient = useContext(ApiClientContext);
  const {
    loaded: userSpaceLoaded,
    loading: userSpaceLoading,
  }: UserSpaceState = useSelector(getUserSpace);
  const [userSpaceLoadDispatched, setUserSpaceLoadDispatched] = useState(false);

  const lastVisited = useSelector(getLastVisited) || [];
  const lastVisitedBoards = useSelector(
    getLastVisitedBoards(lastVisited, itemsToDisplay)
  );

  const metrics = useMetrics('Home');

  useEffect(() => {
    if (!userSpaceLoaded && !userSpaceLoading && !userSpaceLoadDispatched) {
      dispatch(fetchUserSpace(apiClient));
      setUserSpaceLoadDispatched(true);
    }
  }, [
    dispatch,
    apiClient,
    userSpaceLoaded,
    userSpaceLoading,
    userSpaceLoadDispatched,
  ]);

  if (suitesLoading || userSpaceLoading) {
    return <Loader />;
  }

  const handleOpenModal = (modalType: ModalType) => {
    metrics.track('NewSuite_Click');
    dispatch(modalOpen({ modalType }));
  };
  return (
    <>
      <Suitebar
        headerText="Executive overview"
        actionButton={
          canEdit && (
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
      {!suitesLoaded || !suites?.length ? (
        <NoItemsContainer>
          <Graphic type="DataSets" />
          <Title level={5}>You don’t have any suites yet.</Title>
        </NoItemsContainer>
      ) : (
        <OverviewContainer>
          {lastVisitedBoards.length > 0 && (
            <TilesContainer>
              <Title level={6}>Quick Access</Title>
              <Glider
                hasArrows
                itemWidth={glideItemWidth}
                exactWidth={glideItemWidth}
                slidesToShow="auto"
                iconLeft={<Icon type="LargeLeft" />}
                iconRight={<Icon type="LargeRight" />}
                skipTrack
              >
                <div className="glider-track">
                  {lastVisitedBoards?.map((board: Board) => (
                    <a
                      onClick={() =>
                        metrics.track('QuickAccess_Board_Click', {
                          boardKey: board.key,
                          board: board.title,
                        })
                      }
                      key={board.key}
                      href={board.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SmallTile dataItem={board} />
                    </a>
                  ))}
                </div>
              </Glider>
            </TilesContainer>
          )}
          <TilesContainer>
            <Title level={6}>All suites</Title>
            {suites?.map((suite: Suite) => (
              <Link
                to={`/suites/${suite.key}`}
                key={suite.key}
                onClick={() =>
                  metrics.track('Suite_Click', {
                    suiteKey: suite.key,
                    suite: suite.title,
                  })
                }
              >
                <Tile
                  key={suite.key}
                  dataItem={suite}
                  {...(canEdit && { menu: <SuiteMenu dataItem={suite} /> })}
                  avatar
                />
              </Link>
            ))}
          </TilesContainer>
        </OverviewContainer>
      )}
    </>
  );
};

export default Home;
