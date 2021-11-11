import React from 'react';
import { Loader } from '@cognite/cogs.js';
import styled from 'styled-components';

import Breadcrumb from 'components/Breadcrumb/Breadcrumb';
import { BreadcrumbItemProps } from 'components/Breadcrumb/BreadcrumbItem';
import DatabaseList from 'components/DatabaseList';
import NoAccessPage from 'components/NoAccessPage/NoAccessPage';
import TableContent from 'components/TableContent';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import {
  DATABASE_LIST_MARGIN_RIGHT,
  DATABASE_LIST_WIDTH,
} from 'utils/constants';
import { useActiveTable } from 'hooks/table-tabs';
import { useParams } from 'react-router-dom';
import TableTabList from 'components/TableTabList';

const breadcrumbs: Pick<BreadcrumbItemProps, 'path' | 'title'>[] = [
  {
    title: 'Raw explorer',
  },
];

const StyledRawExplorerContent = styled.div`
  display: flex;
  padding: 24px;
`;

const StyledRawExplorerDatabaseListWrapper = styled.div`
  margin-right: ${DATABASE_LIST_MARGIN_RIGHT}px;
  width: ${DATABASE_LIST_WIDTH}px;

  .ant-menu-sub.ant-menu-inline {
    background-color: white;
  }
`;

const StyledRawExplorerTableContentWrapper = styled.div`
  width: calc(100% - ${DATABASE_LIST_WIDTH + DATABASE_LIST_MARGIN_RIGHT}px);
`;

const RawExplorer = (): JSX.Element => {
  const { database, table } = useParams<{
    database?: string;
    table?: string;
  }>();
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
        <div>
          <StyledRawExplorerContent>
            <StyledRawExplorerDatabaseListWrapper>
              <DatabaseList database={database} table={table} />
            </StyledRawExplorerDatabaseListWrapper>

            {tabDatabase && tabTable && (
              <StyledRawExplorerTableContentWrapper>
                <TableTabList />
                <TableContent database={tabDatabase} table={tabTable} />
              </StyledRawExplorerTableContentWrapper>
            )}
          </StyledRawExplorerContent>
        </div>
      ) : (
        <NoAccessPage />
      )}
    </>
  );
};

export default RawExplorer;
