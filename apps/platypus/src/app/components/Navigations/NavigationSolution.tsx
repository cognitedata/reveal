import { useHistory, useParams } from 'react-router-dom';
import {
  TopBar,
  Button,
  Dropdown,
  Body,
  Icon,
  Tooltip,
} from '@cognite/cogs.js';
import { StyledButton, StyledTopBar, StyledTopBarRight } from './elements';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const NavigationSolution = () => {
  const { t } = useTranslation('Solution');

  const tabs: Array<{
    slug: string;
    title: string;
  }> = [
    {
      slug: 'overview',
      title: t('overview_title', 'Overview'),
    },
    {
      slug: 'data',
      title: t('data_title', 'Data'),
    },
    {
      slug: 'tools',
      title: t('tools_title', 'Tools'),
    },
    {
      slug: 'deployments',
      title: t('demployments_title', 'Deployments'),
    },
  ];

  const { solutionId, version, tabKey } = useParams<{
    solutionId: string;
    version: string;
    tabKey: string;
  }>();

  const history = useHistory();

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
    return (
      <StyledTopBarRight>
        <Tooltip placement="bottom" content="WIP..." arrow={false}>
          <StyledButton icon="Settings" />
        </Tooltip>
      </StyledTopBarRight>
    );
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
      <TopBar.Right>{renderTopBarRight()}</TopBar.Right>
    </StyledTopBar>
  );
};
