import React, { useState } from 'react';
import { Input } from 'antd';
import Menu from 'antd/lib/menu';
import Tooltip from 'antd/lib/tooltip';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';
import message from 'antd/lib/message';
import { Button, Icon } from '@cognite/cogs.js';
import Modal from 'antd/lib/modal';
import Popconfirm from 'antd/lib/popconfirm';
import { RawDBTable } from '@cognite/sdk';
import { SubMenuProps } from 'antd/lib/menu/SubMenu';
import theme from 'styles/theme';
import { trackEvent } from '@cognite/cdf-route-tracker';
import Link from 'components/Link';
import { History } from 'history';
import { createLink } from '@cognite/cdf-utilities';
import { cleanUrl, getContainer, stringCompare } from 'utils/utils';
import handleError from 'utils/handleError';
import styled from 'styled-components';
import { stringContains } from 'utils/typedUtils';
import { DATABASE_LIST_WIDTH } from 'utils/constants';
import CreateTable from '../CreateTable';
import { createRawTable } from '../RawFunctions';
import { SortingType } from './DatabaseList';

const { SubMenu } = Menu;

const SUBMENU_MARGIN_LEFT = 24;
const SUBMENU_WIDTH = DATABASE_LIST_WIDTH - SUBMENU_MARGIN_LEFT;

type DatabaseItemProps = SubMenuProps & {
  setSelectedTable(value: { database: string; table?: string }): void;
  isFetching: boolean;
  setIsFetching(value: boolean): void;
  deleteDatabase(value: string): void;
  hasWriteAccess: boolean;
  setOpenKeys(value: string[]): void;
  openKeys: string[];
  selectedTable: { database?: string; table?: string };
  tables: RawDBTable[];
  history: History;
  currentDatabase: string;
  sortingType: SortingType;
};

const StyledMenuItem = styled(Menu.Item)<{ $hasBackground?: boolean }>`
  background-color: ${({ $hasBackground = true }) =>
    $hasBackground ? theme.backgroundColor : '#fff'};
  padding-left: 0 !important; /* overriding antd style */
  padding-right: 0 !important;
  margin-left: ${SUBMENU_MARGIN_LEFT}px;
  width: ${SUBMENU_WIDTH}px !important;
`;

const StyledMenuItemInput = styled(Input.Search)`
  margin-top: 4px;
  width: ${SUBMENU_WIDTH}px;
`;

const StyledMenuItemButton = styled(Button)`
  width: ${SUBMENU_WIDTH}px;
`;

const StyledAlert = styled(Alert)`
  margin-left: ${SUBMENU_MARGIN_LEFT}px;
  margin-top: 4px;
  width: ${SUBMENU_WIDTH}px;
`;

const StyledSubmenuTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StyledDeleteDatabaseButton = styled(Button)`
  background-color: ${theme.backgroundColor};
`;

const StyledTableItemIcon = styled(Icon)`
  margin: 0 8px 0 ${SUBMENU_MARGIN_LEFT}px;
`;

const DatabaseItem = ({
  currentDatabase,
  setSelectedTable,
  isFetching,
  setIsFetching,
  deleteDatabase,
  hasWriteAccess,
  setOpenKeys,
  openKeys,
  tables = [],
  selectedTable,
  history,
  sortingType,
  ...subMenuProps
}: DatabaseItemProps) => {
  const [searchWord, setSearch] = useState<string>('');
  const [createTableVisible, setCreateTableVisible] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');

  const handleMenuClick = (e: {
    key: string;
    domEvent: React.SyntheticEvent;
  }) => {
    if (
      !(
        e.domEvent.target instanceof Element && // eslint-disable-line
        e.domEvent.target.tagName === 'fBUTTON'
      )
    ) {
      if (openKeys.includes(e.key)) {
        setOpenKeys([]);
      } else {
        setOpenKeys([e.key]);
      }
    }
  };

  const renderFilteredList = (filteredList: RawDBTable[]) => {
    return filteredList.map((table) => (
      <StyledMenuItem
        key={`${currentDatabase}-${table.name}`}
        onClick={() => {
          setSelectedTable({
            database: currentDatabase,
            table: table.name,
          });
        }}
      >
        <Link to={`/raw-explorer/${cleanUrl(currentDatabase, table.name)}`}>
          <Tooltip
            placement="topLeft"
            title={`Table ${table.name}`}
            getPopupContainer={getContainer}
          >
            <StyledTableItemIcon type="Table" />
            <span>{table.name}</span>
          </Tooltip>
        </Link>
      </StyledMenuItem>
    ));
  };
  const createTable = async () => {
    setIsFetching(true);
    try {
      const tableName = await createRawTable(currentDatabase, newTableName);
      setNewTableName('');
      setIsFetching(false);
      setCreateTableVisible(false);
      setSearch('');
      message.success(`Table ${tableName} has been created!`);
      history.push(
        createLink(`/raw-explorer/${cleanUrl(currentDatabase, tableName)}`)
      );
      trackEvent('RAW.Explorer.Table.Table.Create', {
        tableName: newTableName,
      });
    } catch (e) {
      handleError(e);
      setIsFetching(false);
    }
  };
  const renderTables = () => {
    const filteredList = tables
      .filter((table) => stringContains(table.name, searchWord))
      .sort((a, b) => {
        switch (sortingType) {
          case 'name-asc':
            return stringCompare(b.name, a.name);
          case 'name-desc':
            return stringCompare(a.name, b.name);
          default:
            return stringCompare(b.name, a.name);
        }
      });
    if (filteredList.length) {
      return renderFilteredList(filteredList);
    }
    return (
      <StyledAlert
        message="No table names match the filter query"
        type="info"
        showIcon
      />
    );
  };

  return (
    <Menu
      selectedKeys={
        selectedTable?.table
          ? [`${selectedTable?.database}-${selectedTable?.table}`]
          : []
      }
      openKeys={openKeys}
      key={currentDatabase}
      mode="inline"
      style={{
        height: '100%',
        borderRight: 0,
        textAlign: 'left',
      }}
    >
      <SubMenu
        {...subMenuProps}
        onTitleClick={(domEvent: any) => handleMenuClick(domEvent)}
        key={currentDatabase}
        style={{
          background: theme.backgroundColor,
          textAlign: 'left',
        }}
        title={
          <StyledSubmenuTitle>
            {hasWriteAccess && (
              <Popconfirm
                title="Are you sure you want to delete this database? Once deleted, the database cannot be recovered."
                onConfirm={() => deleteDatabase(currentDatabase)}
                cancelButtonProps={{ type: 'default' }}
                placement="right"
              >
                <Tooltip
                  title={
                    !hasWriteAccess
                      ? 'To create, edit, or delete tables and databases in RAW, you need the access management capability raw:write'
                      : ''
                  }
                  getPopupContainer={getContainer}
                >
                  <StyledDeleteDatabaseButton icon="Trash" type="secondary" />
                </Tooltip>
              </Popconfirm>
            )}

            {currentDatabase}
          </StyledSubmenuTitle>
        }
      >
        {tables.length ? (
          <StyledMenuItem $hasBackground={false} key="filterTables">
            <StyledMenuItemInput
              placeholder="Filter tables"
              onChange={(e) => setSearch(e.currentTarget.value)}
              onSearch={(value) => setSearch(value)}
              allowClear
              value={searchWord}
            />
          </StyledMenuItem>
        ) : (
          <StyledAlert message="This database has no tables" type="info" />
        )}
        {tables ? renderTables() : <Spin />}

        {hasWriteAccess && (
          <StyledMenuItem
            key="createButton"
            style={{
              color: 'white',
              marginBottom: '5px',
              marginTop: '5px',
            }}
          >
            <StyledMenuItemButton
              type="primary"
              key="createButton"
              onClick={() => setCreateTableVisible(true)}
              icon="PlusCompact"
            >
              Create Table
            </StyledMenuItemButton>
          </StyledMenuItem>
        )}
        <Modal
          title="Create table"
          visible={createTableVisible}
          onCancel={() => setCreateTableVisible(false)}
          okText="Create"
          onOk={() => createTable()}
          getContainer={getContainer}
        >
          {isFetching ? (
            <Spin />
          ) : (
            <CreateTable
              setName={setNewTableName}
              name={newTableName}
              createTable={createTable}
            />
          )}
        </Modal>
      </SubMenu>
    </Menu>
  );
};
export default DatabaseItem;
