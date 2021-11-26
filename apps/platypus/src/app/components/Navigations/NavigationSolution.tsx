import { useHistory, useParams } from 'react-router-dom';
import { TopBar, Button, Dropdown, Body, Icon } from '@cognite/cogs.js';
import { StyledTopBar, StyledTopBarRight } from './elements';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

const tabs: Array<{
  slug: string;
  title: string;
}> = [
  {
    slug: 'overview',
    title: 'Overview',
  },
  {
    slug: 'data-model',
    title: 'Data model',
  },
  {
    slug: 'development-tools',
    title: 'Development tools',
  },
  {
    slug: 'deployments',
    title: 'Deployments',
  },
  {
    slug: 'settings',
    title: 'Settings',
  },
];

export const NavigationSolution = () => {
  const { solutionId, version, tabKey } = useParams<{
    solutionId: string;
    version: string;
    tabKey: string;
  }>();

  const history = useHistory();
  const { t } = useTranslation('navigationSolution');

  const projectManagementLinks = tabs.map((tab) => ({
    name: t(tab.title, tab.title),
    isActive: tabKey === tab.slug || (tab.slug === 'overview' && !tabKey),
    onClick: () => {
      history.push({
        pathname: `/solutions/${solutionId}/${version}/${tab.slug}`,
      });
    },
  }));

  const renderLinks = () => (
    <TopBar.Navigation links={projectManagementLinks} />
  );

  const renderTopBarRight = () => {
    return null;
  };

  return (
    <StyledTopBar>
      <TopBar.Left>
        <TopBar.Actions
          actions={[
            {
              key: 'action1',
              component: <Icon type="Cognite" style={{ color: '#fff' }} />,
              onClick: () => history.push('/'),
            },
          ]}
        ></TopBar.Actions>
        <TopBar.Logo
          logo={<div style={{ width: '2rem' }} />}
          subtitle={
            <Dropdown>
              <Button
                icon="ChevronDownCompact"
                iconPlacement="right"
                unstyled
                style={{ alignItems: 'center' }}
              >
                <Body level={2} style={{ color: '#fff' }}>
                  {solutionId}
                </Body>
              </Button>
            </Dropdown>
          }
          onLogoClick={() => history.push('/')}
        />
        {renderLinks()}
      </TopBar.Left>
      <StyledTopBarRight>{renderTopBarRight()}</StyledTopBarRight>
    </StyledTopBar>
  );
};
