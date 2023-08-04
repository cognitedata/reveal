import React, { useContext } from 'react';

import styled from 'styled-components';

import NoAccessPage from '@raw-explorer/components/NoAccessPage/NoAccessPage';
import SidePanel from '@raw-explorer/components/SidePanel/SidePanel';
import TableTabList from '@raw-explorer/components/TableTabList';
import TableContent from '@raw-explorer/containers/TableContent';
import {
  RawExplorerContext,
  ActiveTableProvider,
} from '@raw-explorer/contexts';
import { useDatabases } from '@raw-explorer/hooks/sdk-queries';
import {
  SIDE_PANEL_MAX_WIDTH,
  SIDE_PANEL_MIN_WIDTH,
} from '@raw-explorer/utils/constants';
import { Allotment, LayoutPriority } from 'allotment';

import { Colors, Loader } from '@cognite/cogs.js';

export type RawExplorerSideMenuItem = 'raw';

const RawExplorer = (): JSX.Element => {
  const { error, isLoading } = useDatabases();

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
              <ActiveTableProvider>
                <TableTabList />
                <TableContent />
              </ActiveTableProvider>
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
