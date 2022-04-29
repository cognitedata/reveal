import React, { useMemo } from 'react';
import AppHeader from 'components/navigation/AppHeader';
import LeftSidebar from 'components/navigation/LeftSidebar';
import ModalManager from 'components/modals/ModalManager';
import GlobalComponents from 'components/navigation/GlobalComponents';
import { useHistory, useLocation } from 'react-router-dom';
import FullScreenModal from 'components/common/FullScreenModal';
import isNil from 'lodash/isNil';
import useFullScreenView from 'hooks/useFullScreenView';

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
