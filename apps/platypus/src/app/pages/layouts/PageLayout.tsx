import styled from 'styled-components/macro';
import {
  SideBarMenu,
  SideBarItem,
} from '../../components/Navigations/SideBarMenu';

type PageLayoutProps = {
  sideBarMenuItems?: Array<SideBarItem>;
  children: JSX.Element;
};

export const PageLayout = ({ sideBarMenuItems, children }: PageLayoutProps) => {
  return (
    <StyledPage>
      {sideBarMenuItems && <SideBarMenu items={sideBarMenuItems} />}
      <StyledPageContent>{children}</StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow: auto;
`;

const StyledPageContent = styled.div`
  flex: 1;
`;
