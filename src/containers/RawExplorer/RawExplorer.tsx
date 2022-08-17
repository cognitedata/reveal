import React, { useContext, useMemo } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Colors, Loader } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
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
  const { flow } = getFlow();
  const { data: hasReadAccess, isFetched: isReadAccessFetched } =
    usePermissions(flow, 'rawAcl', 'READ');
  const { data: hasListAccess, isFetched: isListAccessFetched } =
    usePermissions(flow, 'rawAcl', 'LIST');

  const { data, isLoading: isFetchingDatabases } = useDatabases({
    enabled: hasListAccess,
  });

  const databases = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDB[]
          )
        : ([] as RawDB[]),
    [data]
  );

  const { isSidePanelOpen, setIsSidePanelOpen } =
    useContext(RawExplorerContext);

  if (!isReadAccessFetched || !isListAccessFetched || isFetchingDatabases) {
    return <Loader />;
  }

  return (
    <>
      {hasReadAccess && hasListAccess ? (
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
              <SidePanel
                activePanelKey="raw"
                onClose={() => setIsSidePanelOpen(false)}
                key="raw"
              />
            </Allotment.Pane>
            <Allotment.Pane key="content" priority={LayoutPriority.High}>
              <StyledRawExplorerTableContentWrapper>
                {databases.length > 0 ? (
                  <ActiveTableProvider>
                    <TableTabList />
                    <TableContent />
                  </ActiveTableProvider>
                ) : (
                  <RawExplorerFirstTimeUser />
                )}
              </StyledRawExplorerTableContentWrapper>
            </Allotment.Pane>
          </Allotment>
        </StyledRawExplorerContent>
      ) : (
        <NoAccessPage />
      )}
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
