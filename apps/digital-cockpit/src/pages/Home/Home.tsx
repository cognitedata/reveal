import { ADMIN_GROUP_NAME } from 'constants/cdf';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader,
  Title,
  Button,
  Icon,
  Graphic,
  Body,
  A,
} from '@cognite/cogs.js';
import Glider from 'react-glider';
import Suitebar from 'components/suitebar/Suitebar';
import { LastVisitedTile, ApplicationTile, Tile } from 'components/tiles';
import { SuiteMenu } from 'components/menus';
import {
  TilesContainer,
  OverviewContainer,
  NoItemsContainer,
} from 'styles/common';
import { useSelector, useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { Suite, Board } from 'store/suites/types';
import { getRootSuites, getSuitesTableState } from 'store/suites/selectors';
import { getLastVisitedItems, getUserSpace } from 'store/userSpace/selectors';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import {
  getGroupsState,
  isAdmin as isAdminSelector,
} from 'store/groups/selectors';
import { UserSpaceState } from 'store/userSpace/types';
import { fetchUserSpace } from 'store/userSpace/thunks';
import { ApiClientContext } from 'providers/ApiClientProvider';
import 'glider-js/glider.min.css';
import { useMetrics } from 'utils/metrics';
import { ApplicationItem } from 'store/config/types';
import { TenantContext } from 'providers/TenantProvider';
import { useLink } from 'hooks';
import useCogniteApplications from 'hooks/useCogniteApplications';

const Home = () => {
  const itemsToDisplay = 6;
  const glideItemWidth = 348;
  const dispatch = useDispatch<RootDispatcher>();
  const { loading: suitesLoading, loaded: suitesLoaded } =
    useSelector(getSuitesTableState);
  const suites = useSelector(getRootSuites);
  const isAdmin = useSelector(isAdminSelector);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const canEdit = isAdmin && !groupsFilter?.length;
  const { fusionLink } = useLink();

  const apiClient = useContext(ApiClientContext);
  const { loaded: userSpaceLoaded, loading: userSpaceLoading }: UserSpaceState =
    useSelector(getUserSpace);
  const [userSpaceLoadDispatched, setUserSpaceLoadDispatched] = useState(false);

  const { activeApplications: applications } = useCogniteApplications();
  const lastVisitedItems = useSelector(getLastVisitedItems(applications)).slice(
    0,
    itemsToDisplay
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

  const usefulLinks: ApplicationItem[] = [
    {
      url: fusionLink,
      key: 'cognite-data-fusion',
      iconKey: 'Cognite',
      title: 'Cognite Data Fusion',
      rightIconKey: 'ExternalLink',
    },
    {
      url: 'https://hub.cognite.com',
      key: 'cognite-hub',
      iconKey: 'Cognite',
      title: 'Cognite HUB Community',
      rightIconKey: 'ExternalLink',
    },
  ];

  return (
    <>
      <Suitebar
        headerText="Executive overview"
        actionsPanel={
          canEdit && (
            <>
              <Button
                type="tertiary"
                icon="Add"
                iconPlacement="left"
                onClick={() => handleOpenModal('SelectApplications')}
              >
                Add application
              </Button>
              <Button
                type="tertiary"
                icon="Add"
                iconPlacement="left"
                onClick={() => handleOpenModal('EditSuite')}
              >
                New suite
              </Button>
            </>
          )
        }
      />
      {!suitesLoaded || !suites?.length ? (
        <NoItemsContainer>
          <Graphic type="DataSets" />
          <Title level={5}>You don’t have any suites yet.</Title>
          <Body>
            {canEdit ? (
              <Button
                type="tertiary"
                icon="Add"
                iconPlacement="left"
                onClick={() => handleOpenModal('EditSuite')}
                style={{ marginTop: 8 }}
              >
                New suite
              </Button>
            ) : (
              `You must have the user group ${ADMIN_GROUP_NAME} to setup this area`
            )}
          </Body>
        </NoItemsContainer>
      ) : (
        <OverviewContainer>
          {lastVisitedItems.length > 0 && (
            <TilesContainer>
              <Glider
                hasArrows
                itemWidth={glideItemWidth}
                exactWidth={glideItemWidth}
                slidesToShow="auto"
                iconLeft={<Icon type="ChevronLeftLarge" />}
                iconRight={<Icon type="ChevronRightLarge" />}
                skipTrack
              >
                <div className="glider-track">
                  {lastVisitedItems?.map((board: Board) => (
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
                      <LastVisitedTile dataItem={board} />
                    </a>
                  ))}
                </div>
              </Glider>
            </TilesContainer>
          )}
          {applications.length > 0 && (
            <TilesContainer>
              <Title level={6}>Applications deployed for you</Title>
              {applications?.map((item: ApplicationItem) => (
                <A
                  key={item.key}
                  href={item.url}
                  target="_blank"
                  onClick={() =>
                    metrics.track('Application_Click', {
                      key: item.key,
                      application: item.title,
                    })
                  }
                >
                  <ApplicationTile item={item} />
                </A>
              ))}
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
                  menu={<SuiteMenu suiteItem={suite} />}
                  avatar
                  color={suite.color}
                />
              </Link>
            ))}
          </TilesContainer>
          <TilesContainer>
            <Title level={6}>Useful links</Title>
            {usefulLinks.map((item: ApplicationItem) => (
              <A
                key={item.key}
                href={item.url}
                target="_blank"
                onClick={() =>
                  metrics.track('Application_Click', {
                    key: item.key,
                    application: item.title,
                  })
                }
              >
                <ApplicationTile item={item} />
              </A>
            ))}
          </TilesContainer>
        </OverviewContainer>
      )}
    </>
  );
};

export default Home;
