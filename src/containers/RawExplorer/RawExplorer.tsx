import React, { useContext, useMemo } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Loader } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import NoAccessPage from 'components/NoAccessPage/NoAccessPage';
import SidePanel from 'components/SidePanel/SidePanel';
import TableContent from 'containers/TableContent';
import TableTabList from 'components/TableTabList';
import { RawExplorerContext, ActiveTableProvider } from 'contexts';
import {
  DATABASE_LIST_WIDTH,
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
} from 'utils/constants';
import { useDatabases } from 'hooks/sdk-queries';
import RawExplorerFirstTimeUser from './RawExplorerFirstTimeUser';

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

  const { isSidePanelOpen } = useContext(RawExplorerContext);

  if (!isReadAccessFetched || !isListAccessFetched || isFetchingDatabases) {
    return <Loader />;
  }

  return (
    <>
      {hasReadAccess && hasListAccess ? (
        <StyledRawExplorerContent>
          <SidePanel />
          <StyledRawExplorerTableContentWrapper
            $isSidePanelOpen={isSidePanelOpen}
          >
            {databases.length > 0 ? (
              <ActiveTableProvider>
                <TableTabList />
                <TableContent />
              </ActiveTableProvider>
            ) : (
              <RawExplorerFirstTimeUser />
            )}
          </StyledRawExplorerTableContentWrapper>
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
`;

const StyledRawExplorerTableContentWrapper = styled.div<{
  $isSidePanelOpen: boolean;
}>`
  transition: transform ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  width: calc(
    100% -
      ${({ $isSidePanelOpen }) =>
        $isSidePanelOpen ? DATABASE_LIST_WIDTH : 0}px
  );
`;

export default RawExplorer;
