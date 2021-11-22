import React, { useContext } from 'react';
import { Body, Colors, Loader, Title } from '@cognite/cogs.js';

import styled from 'styled-components';

import Breadcrumb from 'components/Breadcrumb/Breadcrumb';
import { BreadcrumbItemProps } from 'components/Breadcrumb/BreadcrumbItem';
import NoAccessPage from 'components/NoAccessPage/NoAccessPage';

import SidePanel from 'components/SidePanel/SidePanel';
import TableContent from 'containers/TableContent';
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
import icons from 'assets/icons';

const breadcrumbs: Pick<BreadcrumbItemProps, 'path' | 'title'>[] = [
  {
    title: 'Raw explorer',
  },
];

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
          <StyledRawExplorerTableContentWrapper
            $isSidePanelOpen={isSidePanelOpen}
          >
            {tabDatabase && tabTable ? (
              <>
                <TableTabList />
                <TableContent />
              </>
            ) : (
              <StyledRawExplorerNotSelectedWrapper>
                <StyledRawExplorerNotSelectedContent>
                  <StyledRawExplorerNotSelectedArrow
                    src={icons.EmptyStateArrowIcon}
                  />
                  <Title level={3}>Select a table to view raw data</Title>
                  <StyledRawExplorerNotSelectedBody>
                    Use the side menu to navigate between databases and open raw
                    tables.
                  </StyledRawExplorerNotSelectedBody>
                </StyledRawExplorerNotSelectedContent>
              </StyledRawExplorerNotSelectedWrapper>
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
  height: calc(100% - ${BREADCRUMBS_HEIGHT + 1}px);
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

const StyledRawExplorerNotSelectedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 128px;
  position: relative;
`;

const StyledRawExplorerNotSelectedContent = styled.div`
  margin-bottom: 30px;
  width: 400px;
`;

const StyledRawExplorerNotSelectedBody = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  margin-top: 12px;
`;

const StyledRawExplorerNotSelectedArrow = styled.img`
  position: absolute;
  left: 125px;
  opacity: 1;
  transform: translateY(calc(-100% - 75px));
  transition: opacity ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  top: calc(50%);
  max-height: 180px;
  width: calc(50% - 400px);

  @media screen and (max-width: 1400px) {
    opacity: 0;
  }
`;

export default RawExplorer;
