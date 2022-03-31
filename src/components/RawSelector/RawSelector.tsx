import { useState } from 'react';
import Menu from 'antd/lib/menu';
import Col from 'antd/lib/col';
import Table from 'antd/lib/table';
import Checkbox from 'antd/lib/checkbox';
import { Icon } from '@cognite/cogs.js';
import { RawDB, RawDBTable } from '@cognite/sdk';
import { getStringCdfEnv, getContainer } from 'utils/shared';
import {
  StyledMenuItem,
  RawCreateButton,
  ListBox,
  SearchField,
  SearchWrapper,
} from 'utils/styledComponents';
import { RawTable } from 'utils/types';
import Tooltip from 'antd/lib/tooltip';

type DatabaseWithTablesItem = {
  database: RawDB;
  tables: RawDBTable[];
};

interface RawSelectorProps {
  databaseList: RawDB[];
  tableList: DatabaseWithTablesItem[];
  setCreateModal(value: string): void;
  setCreateVisible(value: boolean): void;
  setSelectedDb(value: string): void;
  selectedTables: RawTable[];
  setSelectedTables(value: RawTable[]): void;
  setChangesSaved(value: boolean): void;
  selectedDb: string;
}

const SelectionColumns = [
  {
    title: 'Database selected',
    key: 'databaseName',
    render: (row: RawTable) => (
      <a
        href={`raw/${row.databaseName}${
          getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.databaseName}
      </a>
    ),
  },
  {
    title: 'Table Selected',
    key: 'tableName',
    render: (row: RawTable) => (
      <a
        data-testid="selected-table"
        href={`raw/${row.databaseName}/${row.tableName}${
          getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.tableName}
      </a>
    ),
  },
];

const RawSelector = (props: RawSelectorProps): JSX.Element => {
  const [dbSearch, setDbSearch] = useState<string>('');
  const [tableSearch, setTableSearch] = useState<string>('');

  const onChangeTablesList = (key: string) => {
    const keyItem = {
      databaseName: key.split('/')[0],
      tableName: key.split('/')[1],
    };
    props.setChangesSaved(false);
    if (
      props.selectedTables.some(
        (record) =>
          record.databaseName === keyItem.databaseName &&
          record.tableName === keyItem.tableName
      )
    ) {
      props.setSelectedTables(
        props.selectedTables.filter((item) => {
          return (
            item.databaseName !== keyItem.databaseName ||
            item.tableName !== keyItem.tableName
          );
        })
      );
    } else {
      props.setSelectedTables([keyItem, ...props.selectedTables]);
    }
  };

  const anyDbTableSelected = (dbName: string) => {
    return !!props.selectedTables.find(
      (rawItem) => rawItem.databaseName === dbName
    );
  };

  const allDbTableSelected = (item: RawDB) => {
    return getDatabaseTables(item.name).every(
      (table) =>
        !!props.selectedTables.find(
          (selectedTable) => selectedTable.tableName === table.name
        )
    );
  };

  const handleCheckboxChange = (item: RawDB) => {
    props.setChangesSaved(false);
    if (allDbTableSelected(item)) {
      // unselect all
      props.setSelectedTables(
        props.selectedTables.filter(
          (selectedItem) => item.name !== selectedItem.databaseName
        )
      );
    } else {
      props.setSelectedTables([
        ...getDatabaseTables(item.name).map((table) => ({
          databaseName: item.name,
          tableName: table.name,
        })),
        ...props.selectedTables.filter(
          (rawItem) => rawItem.databaseName !== item.name
        ),
      ]);
    }
  };

  const getDatabasesMenu = () => {
    if (dbSearch !== '') {
      return props.databaseList
        .filter(
          (db) => db.name.toUpperCase().search(dbSearch.toUpperCase()) >= 0
        )
        .map((item) => (
          <StyledMenuItem key={item.name}>
            <Tooltip
              title="Select all tables in this database"
              getPopupContainer={getContainer}
            >
              <Checkbox
                style={{ marginRight: '5px' }}
                data-testid="raw-database"
                checked={anyDbTableSelected(item.name)}
                indeterminate={
                  anyDbTableSelected(item.name)
                    ? !allDbTableSelected(item)
                    : undefined
                }
                onClick={() => handleCheckboxChange(item)}
              />
            </Tooltip>
            {item.name}
          </StyledMenuItem>
        ));
    }
    return props.databaseList.map((item) => (
      <StyledMenuItem key={item.name}>
        <Tooltip
          title="Select all tables in this database"
          getPopupContainer={getContainer}
        >
          <Checkbox
            style={{ marginRight: '5px' }}
            data-testid="raw-database"
            checked={anyDbTableSelected(item.name)}
            indeterminate={
              anyDbTableSelected(item.name)
                ? !allDbTableSelected(item)
                : undefined
            }
            onClick={() => handleCheckboxChange(item)}
          />
        </Tooltip>
        {item.name}
      </StyledMenuItem>
    ));
  };

  const getDatabaseTables = (databaseName: string) => {
    let list: RawDBTable[] = [];
    props.tableList.forEach((item) => {
      if (item.database.name === databaseName) {
        if (tableSearch !== '') {
          list = item.tables.filter(
            (table) =>
              table.name.toUpperCase().search(tableSearch.toUpperCase()) >= 0
          );
        } else {
          list = item.tables;
        }
      }
    });
    return list;
  };

  const selectedDBTables = getDatabaseTables(props.selectedDb);

  return (
    <div>
      <div style={{ padding: '5px' }}>
        <Col span={24}>
          <Col span={12}>
            <h3>Databases</h3>
            <RawCreateButton
              onClick={() => {
                props.setCreateModal('database');
                props.setCreateVisible(true);
              }}
            >
              Create database
            </RawCreateButton>
            {props.databaseList && (
              <ListBox>
                <SearchField
                  placeholder="Filter databases"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(val) => setDbSearch(val.currentTarget.value)}
                />
                <Menu
                  selectedKeys={[props.selectedDb]}
                  onSelect={(value) => props.setSelectedDb(value.key)}
                  mode="inline"
                >
                  {getDatabasesMenu()}
                </Menu>
              </ListBox>
            )}
          </Col>
          <Col span={12}>
            <h3>Tables</h3>
            <RawCreateButton
              onClick={() => {
                props.setCreateModal('table');
                props.setCreateVisible(true);
              }}
              disabled={!props.selectedDb}
            >
              Create table
            </RawCreateButton>
            {props.selectedDb !== '' ? (
              <ListBox>
                <SearchWrapper>
                  <SearchField
                    placeholder="Filter tables"
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(val) => setTableSearch(val.currentTarget.value)}
                  />
                </SearchWrapper>
                <Menu
                  multiple
                  selectedKeys={
                    (props.selectedTables &&
                      props.selectedTables.map(
                        (item) => `${item.databaseName}/${item.tableName}`
                      )) ||
                    []
                  }
                >
                  {selectedDBTables?.length ? (
                    selectedDBTables.map((table, index) => (
                      <StyledMenuItem
                        data-testid="raw-table"
                        key={`${props.selectedDb}/${table.name || ''}`}
                        onClick={(e) => {
                          e.domEvent.stopPropagation();
                          e.domEvent.preventDefault();
                          onChangeTablesList(
                            `${props.selectedDb}/${table.name || ''}`
                          );
                        }}
                      >
                        <Checkbox
                          style={{ marginRight: '5px' }}
                          checked={props.selectedTables.some(
                            (record) =>
                              record.databaseName === props.selectedDb &&
                              record.tableName === table.name
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeTablesList(
                              `${props.selectedDb}/${table.name || ''}`
                            );
                          }}
                          data-testid={`table-checkbox-${index}`}
                        />
                        {table.name || ''}{' '}
                        <div
                          style={{
                            display: 'inline-block',
                            textAlign: 'right',
                            float: 'right',
                          }}
                        >
                          <Tooltip
                            title="View or ingest data to this RAW table"
                            getPopupContainer={getContainer}
                          >
                            <a
                              href={`raw/${props.selectedDb}/${
                                table.name || ''
                              }${
                                getStringCdfEnv()
                                  ? `?env=${getStringCdfEnv()}`
                                  : ''
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Icon type="ArrowDownRight" />
                            </a>
                          </Tooltip>
                        </div>
                      </StyledMenuItem>
                    ))
                  ) : (
                    <div style={{ paddingTop: '20%' }}>
                      <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
                        No tables in this database
                      </p>
                    </div>
                  )}
                </Menu>
              </ListBox>
            ) : (
              <ListBox>
                <div style={{ paddingTop: '20%' }}>
                  <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
                    Select database to view tables in
                  </p>
                </div>
              </ListBox>
            )}
          </Col>
          <Col span={24} style={{ marginTop: '10px' }}>
            <Table
              style={{ marginBottom: '20px' }}
              pagination={{ pageSize: 4 }}
              columns={SelectionColumns}
              dataSource={props.selectedTables}
              rowKey={(record: RawTable) =>
                `${record.databaseName}/${record.tableName}`
              }
              getPopupContainer={getContainer}
            />
          </Col>
        </Col>
      </div>
    </div>
  );
};

export default RawSelector;
