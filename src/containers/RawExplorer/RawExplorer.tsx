import React, { useContext } from 'react';

import { Colors, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import NoAccessPage from 'components/NoAccessPage/NoAccessPage';
import SidePanel from 'components/SidePanel/SidePanel';
import TableContent from 'containers/TableContent';
import TableTabList from 'components/TableTabList';
import { RawExplorerContext, ActiveTableProvider } from 'contexts';
import { SIDE_PANEL_MAX_WIDTH, SIDE_PANEL_MIN_WIDTH } from 'utils/constants';
import { useDatabases } from 'hooks/sdk-queries';
import RawExplorerFirstTimeUser from './RawExplorerFirstTimeUser';
import { Allotment, LayoutPriority } from 'allotment';

export type RawExplorerSideMenuItem = 'raw';

const RawExplorer = (): JSX.Element => {
  const { data, error, isLoading } = useDatabases();

  const databases = data?.pages[0]?.items || [];

  const { isSidePanelOpen, setIsSidePanelOpen } =
    useContext(RawExplorerContext);

  if (error) {
    switch (error.status) {
      case 403: {
        return <NoAccessPage />;
      }
      default: {
        return <>Error</>;
      }
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <StyledRawExplorerContent>
        <Allotment proportionalLayout={false}>
          <Allotment.Pane
            key="side-panel"
            minSize={SIDE_PANEL_MIN_WIDTH}
            maxSize={SIDE_PANEL_MAX_WIDTH}
            preferredSize={SIDE_PANEL_MIN_WIDTH}
            priority={LayoutPriority.Low}
            visible={isSidePanelOpen}
          >
            <SidePanel onClose={() => setIsSidePanelOpen(false)} />
          </Allotment.Pane>
          <Allotment.Pane key="content" priority={LayoutPriority.High}>
            <StyledRawExplorerTableContentWrapper>
              {databases.length === 0 ? (
                <RawExplorerFirstTimeUser />
              ) : (
                <ActiveTableProvider>
                  <TableTabList />
                  <TableContent />
                </ActiveTableProvider>
              )}
            </StyledRawExplorerTableContentWrapper>
          </Allotment.Pane>
        </Allotment>
      </StyledRawExplorerContent>
    </>
  );
};

const StyledRawExplorerContent = styled.div`
  display: flex;
  padding: 0;
  box-sizing: border-box;
  height: 100%;

  --focus-border: ${Colors['border--interactive--hover']};
  --separator-border: ${Colors['border--muted']};
`;

const StyledRawExplorerTableContentWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

export default RawExplorer;
