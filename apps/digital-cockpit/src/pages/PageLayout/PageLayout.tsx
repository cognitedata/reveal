import React, { useEffect, useMemo } from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import ModalManager from 'components/modals/ModalManager';
import GlobalComponents from 'components/navigation/GlobalComponents';
import { useLocation } from 'react-router-dom';
import FullScreenModal from 'components/common/FullScreenModal';
import useFullScreenView from 'hooks/useFullScreenView';
import { Body, toast } from '@cognite/cogs.js';

import { Content, Main, Container, ContentWrapper } from './elements';

interface Props {
  children: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }: Props) => {
  const location = useLocation();
  const shouldShowSidebar = location.pathname !== '/';

  const {
    clearUrlParams,
    urlParams: { fullScreen, docId, timeseriesId },
  } = useFullScreenView();

  // notification for NOC users of GCP version
  useEffect(() => {
    if (
      window.location.href.startsWith(
        `https://digital-cockpit.cogniteapp.com/noc`
      )
    ) {
      toast.warning(
        <Body>
          Digital Cockpit have been moved to a new and upgraded Environment.
          Kindly use this{' '}
          <a href="https://digital-cockpit.westeurope-1.cogniteapp.com">link</a>{' '}
          to directly access the upgraded version. For any query or
          clarification kindly reach out to{' '}
          <a href="mailto:digital.twin@noc.qa">digital.twin@noc.qa</a>
        </Body>,
        { autoClose: false }
      );
    }
  }, []);

  return (
    <>
      <Container>
        <AppHeader />
        <Main>
          {shouldShowSidebar && <LeftSidebar />}
          <ContentWrapper>
            <Content className="content">{children}</Content>
          </ContentWrapper>
        </Main>
        <FullScreenModal
          visible={fullScreen}
          docId={docId}
          timeseriesId={timeseriesId}
          onCancel={clearUrlParams}
        />
        <ModalManager />
      </Container>
      <GlobalComponents />
    </>
  );
};

export default PageLayout;
