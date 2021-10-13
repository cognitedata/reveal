import styled from 'styled-components/macro';
import { useLocation, useHistory } from 'react-router-dom';
import { TopBar, Title, Colors } from '@cognite/cogs.js';
import { NavigationLink } from '@cognite/cogs.js/dist/Components/TopBar/Modules/Navigation';

const tabs: Array<{
  slug: string;
  title: string;
}> = [
  {
    slug: 'solutions',
    title: 'Solutions',
  },
  {
    slug: 'guidetools',
    title: 'Guide & Tools',
  },
  {
    slug: 'statusboard',
    title: 'Statusboard',
  },
];

export const Header = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const projectManagementLinks: NavigationLink[] = tabs.map((tab) => ({
    name: tab.title,
    isActive:
      pathname.startsWith(`/${tab.slug}`) ||
      (tab.slug === 'solutions' && pathname === '/'),
    onClick: () => {
      history.push({
        pathname: `/${tab.slug}`,
      });
    },
  }));

  const renderLinks = () => (
    <TopBar.Navigation links={projectManagementLinks} />
  );

  return (
    <TopBar>
      <TopBar.Left>
        <StyledTopBarItemLogo
          onClick={() => {
            history.push('/');
          }}
        >
          <StyledLogo />
          <StyledTitleLogo level={6}>Platypus</StyledTitleLogo>
        </StyledTopBarItemLogo>
        {renderLinks()}
      </TopBar.Left>
      <TopBar.Right />
    </TopBar>
  );
};

const StyledTopBarItemLogo = styled(TopBar.Item)`
  padding: 0 2rem;
  cursor: pointer;
  &:hover {
    background-color: ${Colors['midblue-8'].hex()};
  }
`;

const StyledLogo = styled.div`
  width: 70px;
  height: 35px;
  background: transparent url('/images/logos/cognite-platypus.png') center
    center no-repeat;
  background-size: 63px;
`;

const StyledTitleLogo = styled(Title)`
  font-weight: 700;
  font-size: 1.4rem;
  margin-left: 0.5rem;
`;
