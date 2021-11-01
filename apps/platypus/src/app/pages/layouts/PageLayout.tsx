import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';
import {
  SideBarMenu,
  SideBarItem,
} from '../../components/Navigations/SideBarMenu';

type PageLayoutProps = {
  sideBarMenuItems: Array<SideBarItem>;
  pageTitle: string;
  pageContent: JSX.Element;
};

export const PageLayout = ({
  sideBarMenuItems,
  pageTitle,
  pageContent,
}: PageLayoutProps) => {
  return (
    <StyledPage>
      <SideBarMenu items={sideBarMenuItems} />
      <StyledPageContent>
        <StyledHeader>
          <Title
            level={4}
            style={{ padding: '1.5rem 2rem', borderBottom: 'solid 1px #eee' }}
          >
            {pageTitle}
          </Title>
        </StyledHeader>
        <StyledContent>{pageContent}</StyledContent>
      </StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

const StyledHeader = styled.div`
  width: 100%;
  flex: 0;
`;

const StyledContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  font-size: 3rem;
  overflow: auto;
  position: relative;
  padding: 2rem;
  height: 100%;
`;

const StyledPageContent = styled.div`
  flex: 1;
`;
