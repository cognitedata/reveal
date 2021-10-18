import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { createLink } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { message, Modal, Spin } from 'antd';
import styled from 'styled-components';

import Breadcrumb from 'components/Breadcrumb/Breadcrumb';
import { BreadcrumbItemProps } from 'components/Breadcrumb/BreadcrumbItem';
import CreateDatabase from 'components/CreateDatabase/CreateDatabase';
import DatabaseList from 'components/DatabaseList';
import NoAccessPage from 'components/NoAccessPage/NoAccessPage';
import TableContent from 'components/TableContent';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { createRawDatabase } from 'utils/api';
import {
  DATABASE_LIST_MARGIN_RIGHT,
  DATABASE_LIST_WIDTH,
} from 'utils/constants';
import handleError from 'utils/handleError';
import sdk from 'utils/sdkSingleton';
import { getContainer } from 'utils/utils';

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
  const history = useHistory();
  const { dbName, tableName } = useParams<{
    dbName?: string;
    tableName?: string;
  }>();

  const [selectedTable, setSelectedTable] = useState<{
    database?: string;
    table?: string;
  }>({ database: undefined, table: undefined });
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [createdDatabase, setCreatedDatabase] = useState<string>('');

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const {
    data: hasReadAccess,
    isFetched: isReadAccessFetched,
  } = useUserCapabilities('rawAcl', 'READ');
  const {
    data: hasListAccess,
    isFetched: isListAccessFetched,
  } = useUserCapabilities('rawAcl', 'LIST');

  useEffect(() => {
    if (dbName) {
      setOpenKeys([dbName]);
      setSelectedTable({ database: dbName });
    }
    if (dbName && tableName) {
      setSelectedTable({
        database: unescape(dbName),
        table: unescape(tableName),
      });
    }
  }, [dbName, tableName]);

  const deleteDatabase = async (databaseName: string) => {
    setIsFetching(true);
    setSelectedTable({ database: undefined, table: undefined });
    try {
      await sdk.raw.deleteDatabases([{ name: databaseName }]);
      setOpenKeys([]);
      setIsFetching(false);
      message.success(`Database ${databaseName} successfully deleted!`);
      trackEvent('RAW.Explorer.Database.Delete', { databaseName });
    } catch (e) {
      handleError(e);
      setIsFetching(false);
    }
  };

  const deleteTable = async (databaseName: string, deletedTable: string) => {
    setIsFetching(true);
    try {
      const unescapedTableName = unescape(deletedTable);
      const unescapedDBName = unescape(databaseName);
      await sdk.raw.deleteTables(unescapedDBName, [
        { name: unescapedTableName },
      ]);
      trackEvent('RAW.Explorer.Table.Delete', {
        deletedTable,
      });
      message.success(`Table ${unescapedTableName} successfully deleted!`);
      history.push(createLink(`/raw-explorer/${databaseName}`));
      setIsFetching(false);
    } catch (e) {
      handleError(e);
      setIsFetching(false);
    }
  };

  const createDatabase = async () => {
    setIsFetching(true);
    try {
      const resultName = await createRawDatabase(createdDatabase);
      setIsFetching(false);
      setSelectedTable({ database: resultName });
      setOpenKeys([resultName]);
      setCreatedDatabase('');
      setCreateModalVisible(false);
      message.success(`Database ${resultName} has been created!`);
      trackEvent('RAW.Explorer.Database.Create', {
        resultName,
      });
    } catch (e) {
      handleError(e);
      setIsFetching(false);
    }
  };

  if (!isReadAccessFetched || !isListAccessFetched) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumb isFillingSpace items={breadcrumbs} />
      {hasReadAccess && hasListAccess ? (
        <>
          <Modal
            title="Create database"
            visible={createModalVisible}
            onCancel={() => setCreateModalVisible(false)}
            okText="Create"
            onOk={() => createDatabase()}
            getContainer={getContainer}
          >
            <Spin spinning={isFetching}>
              <CreateDatabase
                setName={setCreatedDatabase}
                name={createdDatabase}
                createDatabase={createDatabase}
              />
            </Spin>
          </Modal>
          <div>
            <StyledRawExplorerContent>
              <StyledRawExplorerDatabaseListWrapper>
                <DatabaseList
                  openKeys={openKeys}
                  setOpenKeys={setOpenKeys}
                  setCreateModalVisible={setCreateModalVisible}
                  setSelectedTable={setSelectedTable}
                  isFetching={isFetching}
                  setIsFetching={setIsFetching}
                  selectedTable={selectedTable}
                  deleteDatabase={deleteDatabase}
                  hasWriteAccess={hasWriteAccess}
                  history={history}
                />
              </StyledRawExplorerDatabaseListWrapper>
              <StyledRawExplorerTableContentWrapper>
                <TableContent
                  deleteTable={deleteTable}
                  isFetching={isFetching}
                  setIsFetching={setIsFetching}
                  hasWriteAccess={hasWriteAccess}
                />
              </StyledRawExplorerTableContentWrapper>
            </StyledRawExplorerContent>
          </div>
        </>
      ) : (
        <NoAccessPage />
      )}
    </>
  );
};

export default RawExplorer;
