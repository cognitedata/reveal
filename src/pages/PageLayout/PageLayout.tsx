import React from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import ModalManager from 'components/modals/ModalManager';
import GlobalComponents from 'components/navigation/GlobalComponents';
import { Content, Main, Container, ContentWrapper } from './elements';

interface Props {
  children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }: Props) => (
  <>
    <Container>
      <AppHeader />
      <Main>
        <LeftSidebar />
        <ContentWrapper>
          <Content className="content">{children}</Content>
        </ContentWrapper>
      </Main>
      <ModalManager />
    </Container>
    <GlobalComponents />
  </>
);

export default PageLayout;
