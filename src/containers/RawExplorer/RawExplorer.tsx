import React, { useContext } from 'react';

import { Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import Breadcrumb from 'components/Breadcrumb/Breadcrumb';
import { BreadcrumbItemProps } from 'components/Breadcrumb/BreadcrumbItem';
import NoAccessPage from 'components/NoAccessPage/NoAccessPage';
import SidePanel from 'components/SidePanel/SidePanel';
import TableContent from 'components/TableContent';
import TableTabList from 'components/TableTabList';
import { RawExplorerContext } from 'contexts';
import { useActiveTable } from 'hooks/table-tabs';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import {
  BREADCRUMBS_HEIGHT,
  DATABASE_LIST_WIDTH,
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
} from 'utils/constants';

const breadcrumbs: Pick<BreadcrumbItemProps, 'path' | 'title'>[] = [
  {
    title: 'Raw explorer',
  },
];

const StyledRawExplorerContent = styled.div`
  display: flex;
  padding: 0;
  box-sizing: border-box;
  height: calc(100% - ${BREADCRUMBS_HEIGHT}px);
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

const RawExplorer = (): JSX.Element => {
  const { isSidePanelOpen } = useContext(RawExplorerContext);

  const [[tabDatabase, tabTable] = [undefined, undefined]] = useActiveTable();

  const { data: hasReadAccess, isFetched: isReadAccessFetched } =
    useUserCapabilities('rawAcl', 'READ');
  const { data: hasListAccess, isFetched: isListAccessFetched } =
    useUserCapabilities('rawAcl', 'LIST');

  if (!isReadAccessFetched || !isListAccessFetched) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumb isFillingSpace items={breadcrumbs} />
      {hasReadAccess && hasListAccess ? (
        <StyledRawExplorerContent>
          <SidePanel />

          {tabDatabase && tabTable && (
            <StyledRawExplorerTableContentWrapper
              $isSidePanelOpen={isSidePanelOpen}
            >
              <TableTabList />
              <TableContent />
            </StyledRawExplorerTableContentWrapper>
          )}
        </StyledRawExplorerContent>
      ) : (
        <NoAccessPage />
      )}
    </>
  );
};

export default RawExplorer;
