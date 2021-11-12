import React, { useEffect, useMemo, useState } from 'react';
import { notification, Input } from 'antd';
import Menu from 'antd/lib/menu';
import Tooltip from 'antd/lib/tooltip';
import Alert from 'antd/lib/alert';

import { Button, Icon } from '@cognite/cogs.js';
import Popconfirm from 'antd/lib/popconfirm';
import { RawDBTable } from '@cognite/sdk';
import { SubMenuProps } from 'antd/lib/menu/SubMenu';
import theme from 'styles/theme';
import { createLink } from '@cognite/cdf-utilities';
import { useHistory, useParams } from 'react-router-dom';
import { getContainer, stringCompare } from 'utils/utils';
import styled from 'styled-components';
import { stringContains } from 'utils/typedUtils';
import { DATABASE_LIST_WIDTH } from 'utils/constants';
import { useDeleteDatabase, useTables } from 'hooks/sdk-queries';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import CreateTable from '../CreateTable';
import { SortingType } from './DatabaseList';
import { useOpenTable } from 'hooks/table-tabs';

const { SubMenu } = Menu;

const SUBMENU_MARGIN_LEFT = 24;
const SUBMENU_WIDTH = DATABASE_LIST_WIDTH - SUBMENU_MARGIN_LEFT;

type DatabaseItemProps = SubMenuProps & {
  database: string;
  table?: string;
  openItem: boolean;
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

const StyledAlert = styled(Alert)`
  margin-left: ${SUBMENU_MARGIN_LEFT}px;
  margin-top: 4px;
  width: ${SUBMENU_WIDTH}px;
`;

const StyledSubmenuTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StyledTableItemIcon = styled(Icon)`
  margin: 0 8px 0 ${SUBMENU_MARGIN_LEFT}px;
`;

const DatabaseItem = ({
  database,
  table,
  sortingType,
  openItem,
  ...subMenuProps
}: DatabaseItemProps) => {
  const history = useHistory();
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { mutate: deleteDatabase } = useDeleteDatabase();
  const { appPath } = useParams<{ appPath: string }>();
  const [searchWord, setSearch] = useState<string>('');

  const openTab = useOpenTable();

  const { data, isLoading, hasNextPage, fetchNextPage } = useTables(
    {
      database,
    },
    { enabled: openItem }
  );

  useEffect(() => {
    if (!isLoading && hasNextPage) {
      fetchNextPage();
    }
  }, [isLoading, hasNextPage, fetchNextPage]);

  const tables = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDBTable[]
          )
        : ([] as RawDBTable[]),
    [data]
  );

  const renderFilteredList = (filteredList: RawDBTable[]) => {
    return filteredList.map((_table) => (
      <StyledMenuItem key={`${database}-${_table.name}`}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            openTab([database, _table.name]);
          }}
        >
          <Tooltip
            placement="topLeft"
            title={`Table ${_table.name}`}
            getPopupContainer={getContainer}
          >
            <StyledTableItemIcon type="Table" />
            <span>{_table.name}</span>
          </Tooltip>
        </a>
      </StyledMenuItem>
    ));
  };
  const renderTables = () => {
    const filteredList = tables
      .filter((_table) => stringContains(_table.name, searchWord))
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
      selectedKeys={table ? [table] : []}
      openKeys={openItem ? [database] : []}
      key={database}
      mode="inline"
      style={{
        height: '100%',
        borderRight: 0,
        textAlign: 'left',
      }}
    >
      <SubMenu
        {...subMenuProps}
        onTitleClick={(event) =>
          history.push(createLink(`/${appPath}/${event.key}`))
        }
        key={database}
        style={{
          background: theme.backgroundColor,
          textAlign: 'left',
        }}
        title={
          <StyledSubmenuTitle>
            {hasWriteAccess && (
              <Popconfirm
                title="Are you sure you want to delete this database? Once deleted, the database cannot be recovered."
                onConfirm={() =>
                  deleteDatabase(
                    { database },
                    {
                      onSuccess() {
                        notification.success({
                          message: `Database ${database} deleted!`,
                          key: 'database-delete',
                        });
                        history.replace(createLink(`/${appPath}`));
                      },
                      onError(e: any) {
                        notification.error({
                          message: (
                            <p>
                              <p>Database ${database} was not deleted!</p>
                              <pre>{JSON.stringify(e?.errors, null, 2)}</pre>
                            </p>
                          ),
                          key: 'database-delete',
                        });
                      },
                    }
                  )
                }
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
                  <Button
                    aria-label="Delete database"
                    icon="Trash"
                    type="ghost"
                  />
                </Tooltip>
              </Popconfirm>
            )}

            {database}
          </StyledSubmenuTitle>
        }
      >
        {tables.length ? (
          <StyledMenuItem $hasBackground={false} key="filterTables">
            <StyledMenuItemInput
              aria-label="Searched table name"
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
        {tables ? renderTables() : <Icon type="Loading" />}

        <CreateTable database={database} />
      </SubMenu>
    </Menu>
  );
};
export default DatabaseItem;
