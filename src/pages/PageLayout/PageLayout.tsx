import React from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import ModalManager from 'components/modals/ModalManager';
import { Content, Main, Container } from './elements';

interface Props {
  children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }: Props) => (
  <Container>
    <AppHeader />
    <Main>
      <LeftSidebar />
      <Content>{children}</Content>
    </Main>
    <ModalManager />
  </Container>
);

export default PageLayout;
