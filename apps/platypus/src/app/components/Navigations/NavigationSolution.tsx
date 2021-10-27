import styled from 'styled-components/macro';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { TopBar, Button, Dropdown, Body, Icon } from '@cognite/cogs.js';
import { NavigationLink } from '@cognite/cogs.js/dist/Components/TopBar/Modules/Navigation';
import { solutions } from '../../mocks/solutions';

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
  const { pathname } = useLocation();

  const { solutionId, tabKey } = useParams<{
    solutionId: string;
    tabKey: string;
  }>();
  const history = useHistory();

  const projectManagementLinks: NavigationLink[] = tabs.map((tab) => ({
    name: tab.title,
    isActive:
      pathname.endsWith(`/${tab.slug}`) || (tab.slug === 'overview' && !tabKey),
    onClick: () => {
      history.push({
        pathname: `/solutions/${solutionId}/${tab.slug}`,
      });
    },
  }));

  const renderLinks = () => (
    <TopBar.Navigation links={projectManagementLinks} />
  );
  const solution = solutions.find((s) => s.id.toString() === solutionId);

  const renderTopBarRight = () => {
    return null;
    // Commented for the future implementation
    // return (
    //   <>
    //     <Label icon="World" iconPlacement="right" style={{ color: '#fff' }} />
    //     <Label
    //       icon="Checkmark"
    //       iconPlacement="left"
    //       variant="success"
    //       style={{ margin: '0 0 0 1rem', color: 'var(--cogs-success)' }}
    //     >
    //       Operating
    //     </Label>
    //     <StyledOpenBtnWrapper>
    //       <Button
    //         type="tertiary"
    //         icon="OpenExternal"
    //         iconPlacement="right"
    //         variant="inverted"
    //         style={{ margin: '0 1.5rem' }}
    //       >
    //         Open
    //       </Button>
    //     </StyledOpenBtnWrapper>
    //   </>
    // );
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
                  {solution?.name}
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

const StyledTopBarRight = styled(TopBar.Right)`
  display: flex;
  align-items: center;
`;

const StyledTopBar = styled(TopBar)`
  &.cogs-topbar {
    background-color: var(--cogs-bg-inverted);
  }

  .cogs-topbar--item :hover {
    background-color: var(--cogs-bg-inverted) !important;
  }

  .navigation-item {
    &:hover {
      background-color: var(--cogs-greyscale-grey8) !important;
      color: #fff !important;
    }
  }

  .navigation-item {
    background-color: var(--cogs-bg-inverted) !important;
    color: #fff !important;
  }

  .navigation-item.active {
    margin-top: 0 !important;
    height: 100% !important;
    color: var(--cogs-greyscale-grey1) !important;
  }

  .navigation-item.active:after {
    background-color: #fff !important;
  }

  .cogs-topbar--item__logo,
  .cogs-topbar--item__navigation {
    border-left: solid 1px var(--cogs-greyscale-grey8) !important;
    display: flex;
    align-items: center;
    align-self: center;
  }

  h6,
  .cogs-detail {
    color: #fff !important;
  }

  .cogs-topbar--item__navigation button {
    color: var(--cogs-greyscale-grey5) !important;

    .acitve {
      color: var(--cogs-text-inverted) !important;
    }
  }

  .cogs-icon-Cognite {
    width: 30px !important;
  }

  .actions-item {
    :hover {
      background-color: var(--cogs-greyscale-grey8) !important;
    }
  }

  .cogs-topbar--item__actions {
    border-left: none;
  }
`;
