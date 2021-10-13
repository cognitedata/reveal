import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Graphic, TopBar } from '@cognite/cogs.js';
import sidecar from 'configs/sidecar';
import { windowOpenNewTab } from 'utils/window';
import { mainPages } from 'configs/navigation';
import { UserAvatar } from 'components/Atoms/UserAvatar';

export const MainHeader: React.FC = () => {
  const history = useHistory();

  const [currentPage, setCurrentPage] = React.useState<string>(
    history.location.pathname
  );

  React.useEffect(() => {
    const unsubscribe = history.listen((location) => {
      setCurrentPage(location.pathname);
    });

    return unsubscribe;
  }, []);

  const isCurrentPage = (page: string) => {
    return currentPage.includes(page);
  };

  const navigate = (page: string) => {
    history.push(page);
  };

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Discover"
          logo={
            <Graphic
              type="Discover"
              style={{ width: 36, margin: '6px 8px 0 12px' }}
              onClick={() => navigate('/')}
            />
          }
          subtitle="Cognuit"
        />
        <TopBar.Navigation
          links={[
            {
              name: mainPages.configurations.title,
              isActive: isCurrentPage(mainPages.configurations.url),
              onClick: () => navigate(mainPages.configurations.url),
            },
            {
              name: mainPages.dataTransfers.title,
              isActive: isCurrentPage(mainPages.dataTransfers.url),
              onClick: () => navigate(mainPages.dataTransfers.url),
            },
            {
              name: mainPages.status.title,
              isActive: isCurrentPage(mainPages.status.url),
              onClick: () => navigate(mainPages.status.url),
            },
          ]}
        />
      </TopBar.Left>

      <TopBar.Right>
        <TopBar.Action
          icon="Help"
          onClick={() => {
            windowOpenNewTab(sidecar.cogniteSupportUrl);
          }}
        />

        <TopBar.Actions
          actions={[
            {
              key: 'user-action',
              component: <UserAvatar />,
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
};

export default MainHeader;
