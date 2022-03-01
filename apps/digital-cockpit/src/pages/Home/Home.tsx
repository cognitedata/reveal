import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader, Title, Icon } from '@cognite/cogs.js';
import Glider from 'react-glider';
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
import { useLink } from 'hooks';
import useCogniteApplications from 'hooks/useCogniteApplications';
import { useAuthContext } from '@cognite/react-container';
import Card from 'components/cards/Card';
import { SpecialIconType } from 'components/icons/IconContainer';
import SuiteAvatar from 'components/suiteAvatar';

import { CardGrid, HomeWrapper } from './elements';

const Home = () => {
  const itemsToDisplay = 6;
  const glideItemWidth = 348;
  const dispatch = useDispatch<RootDispatcher>();
  const { loading: suitesLoading, loaded: suitesLoaded } =
    useSelector(getSuitesTableState);
  const { authState } = useAuthContext();

  const suites = useSelector(getRootSuites);
  const isAdmin = useSelector(isAdminSelector);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const canEdit = isAdmin && !groupsFilter?.length;
  const { fusionLink } = useLink();

  const apiClient = useContext(ApiClientContext);
  const { loaded: userSpaceLoaded, loading: userSpaceLoading }: UserSpaceState =
    useSelector(getUserSpace);
  const [userSpaceLoadDispatched, setUserSpaceLoadDispatched] = useState(false);
  const [installedApps, setInstalledApps] = useState<ApplicationItem[]>();
  const { activeApplications: applications, getInstalledApplications } =
    useCogniteApplications();
  const lastVisitedItems = useSelector(getLastVisitedItems(applications)).slice(
    0,
    itemsToDisplay
  );

  const metrics = useMetrics('Home');

  useEffect(() => {
    getInstalledApplications().then(setInstalledApps);
  }, []);

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
    metrics.track('NewSuite_Click', { modalType });
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

  const renderRecents = () => {
    return (
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
          {lastVisitedItems?.map((board: any) => (
            <Card
              lastVistedKey={board.key}
              key={board.key}
              url={board.url}
              header={{
                title: board.title,
                icon: board.iconKey || (
                  <SuiteAvatar title={board.title} color={board.color} />
                ),
                appendIcon: 'ChevronRight',
                onClick: () => {
                  metrics.track('QuickAccess_Board_Click', {
                    boardKey: board.key,
                    board: board.title,
                  });
                },
              }}
            />
          ))}
        </div>
      </Glider>
    );
  };

  const renderSolutions = () => {
    return (
      <>
        <Link to="/explore">
          <Card
            isMini
            header={{
              title: 'Explorer',
              icon: 'Cognite',
              onClick: () => {
                metrics.track('Explorer_Click');
              },
            }}
          />
        </Link>
        {[...(installedApps || []), ...(applications || [])].map(
          (item: ApplicationItem) => (
            <Card
              lastVistedKey={item.key}
              key={item.key}
              url={item.url}
              isMini
              header={{
                title: item.title,
                icon: item.iconKey as SpecialIconType,
                onClick: () => {
                  metrics.track('Application_Click', {
                    key: item.key,
                    application: item.title,
                  });
                },
              }}
            />
          )
        )}
      </>
    );
  };

  const renderCollections = () => {
    if (!suites || suites.length === 0) {
      return (
        <div>
          <p>No suites created yet!</p>
          {canEdit && (
            <button
              type="button"
              className="browse-solutions"
              onClick={() => handleOpenModal('EditSuite')}
            >
              <Icon type="Add" />
              <div>Create your first suite</div>
            </button>
          )}
        </div>
      );
    }
    return (
      <CardGrid>
        {suites?.map((suite: Suite) => (
          <Link to={`/suites/${suite.key}`} key={suite.key}>
            <Card
              lastVistedKey={suite.key}
              header={{
                title: suite.title,
                icon: <SuiteAvatar title={suite.title} color={suite.color} />,
                onClick: () => {
                  metrics.track('Suite_Click', {
                    suiteKey: suite.key,
                    suite: suite.title,
                  });
                },
              }}
            />
          </Link>
        ))}
        {canEdit && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="browse-solutions"
              onClick={() => handleOpenModal('EditSuite')}
            >
              <Icon type="Add" />
              <div>New Suite</div>
            </button>
          </div>
        )}
      </CardGrid>
    );
  };

  const renderUsefulLinks = () => {
    return (
      <CardGrid>
        {usefulLinks.map((item: ApplicationItem) => (
          <Card
            key={item.key}
            url={item.url}
            header={{
              title: item.title,
              icon: item.iconKey as SpecialIconType,
              onClick: () => {
                metrics.track('Application_Click', {
                  key: item.key,
                  application: item.title,
                });
              },
            }}
          />
        ))}
      </CardGrid>
    );
  };

  return (
    <HomeWrapper>
      <header>
        <Title level={3}>
          Welcome, {authState?.username || authState?.email?.split('@')[0]}
        </Title>
        <p>
          This is your Portal to solutions built on top of Cognite Data Fusion.
        </p>
      </header>
      {lastVisitedItems && lastVisitedItems.length > 0 && (
        <section>
          <Title level={5}>Continue where you left of</Title>
          <div className="section-content">{renderRecents()}</div>
        </section>
      )}
      <section>
        <Title level={5}>Your CDF Solutions</Title>
        <p>
          Find the perfect tool for the job with one of your installed
          solutions.
        </p>
        <div className="section-content">
          {renderSolutions()}
          <button
            type="button"
            className="browse-solutions"
            onClick={() => handleOpenModal('SelectApplications')}
          >
            <Icon type="ArrowRight" />
            <div>Browse Solutions</div>
          </button>
        </div>
      </section>

      <section>
        <Title level={5}>Company Suites</Title>
        <p>A group of resources for your ongoing project work.</p>
        <div className="section-content">{renderCollections()}</div>
      </section>

      <section>
        <Title level={5}>Useful Links</Title>
        <p>Explore the CDF Ecosystem</p>
        <div className="section-content">{renderUsefulLinks()}</div>
      </section>
    </HomeWrapper>
  );
};

export default Home;
