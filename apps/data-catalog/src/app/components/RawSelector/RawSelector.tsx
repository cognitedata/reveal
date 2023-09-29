import { useState } from 'react';

import { Icon, Checkbox, Table, Tooltip, Menu } from '@cognite/cogs.js';
import { RawDB, RawDBTable } from '@cognite/sdk';

import { useTranslation } from '../../common/i18n';
import {
  CogsTableCellRenderer,
  Col,
  getContainer,
  getStringCdfEnv,
  ListBox,
  RawCreateButton,
  RawTable,
  Row,
  SearchField,
  SearchWrapper,
} from '../../utils';

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

const useSelectionColumns = () => {
  const { t } = useTranslation();

  const selectionColumns = [
    {
      Header: t('database-selected'),
      id: 'databaseName',
      disableSortBy: true,
      Cell: ({
        row: { original: rawTable },
      }: CogsTableCellRenderer<RawTable>) => (
        <a
          href={`raw/${rawTable.databaseName}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {rawTable.databaseName}
        </a>
      ),
    },
    {
      Header: t('table-selected'),
      id: 'tableName',
      disableSortBy: true,
      Cell: ({
        row: { original: rawTable },
      }: CogsTableCellRenderer<RawTable>) => (
        <a
          data-testid="selected-table"
          href={`raw/${rawTable.databaseName}/${rawTable.tableName}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {rawTable.tableName}
        </a>
      ),
    },
  ];

  return { selectionColumns };
};

const RawSelector = (props: RawSelectorProps): JSX.Element => {
  const { t } = useTranslation();
  const { selectionColumns } = useSelectionColumns();
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
          <Menu.Item
            key={item.name}
            style={{
              borderBottom: '1px solid var(--cogs-border--muted)',
              fontWeight: 'bold',
              borderRadius: 0,
            }}
            onClick={() => {
              props.setSelectedDb(item.name);
            }}
          >
            <Tooltip
              content={t('select-all-tables-in-this-database')}
              appendTo={getContainer}
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
                onChange={() => handleCheckboxChange(item)}
              />
            </Tooltip>
            {item.name}
          </Menu.Item>
        ));
    }
    return props.databaseList.map((item) => (
      <Menu.Item
        key={item.name}
        style={{
          borderBottom: '1px solid var(--cogs-border--muted)',
          fontWeight: 'bold',
          borderRadius: 0,
          backgroundColor: props.selectedDb === item.name ? '#e6f7ff' : 'white',
        }}
        onClick={() => {
          props.setSelectedDb(item.name);
        }}
      >
        <Tooltip
          content={t('select-all-tables-in-this-database')}
          appendTo={getContainer}
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
            onChange={() => handleCheckboxChange(item)}
          />
        </Tooltip>
        {item.name}
      </Menu.Item>
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
        <Row>
          <Col span={12}>
            <h3>{t('database_other')}</h3>
            <RawCreateButton
              onClick={() => {
                props.setCreateModal('database');
                props.setCreateVisible(true);
              }}
            >
              {t('create-database')}
            </RawCreateButton>
            {props.databaseList && (
              <ListBox>
                <SearchField
                  placeholder={t('filter-databases')}
                  icon="Search"
                  fullWidth
                  style={{ width: '100%' }}
                  clearable={{
                    callback: () => setDbSearch(''),
                  }}
                  onChange={(val) => setDbSearch(val.currentTarget.value)}
                />
                <Menu>{getDatabasesMenu()}</Menu>
              </ListBox>
            )}
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <h3>{t('table_other')}</h3>
            <RawCreateButton
              onClick={() => {
                props.setCreateModal('table');
                props.setCreateVisible(true);
              }}
              disabled={!props.selectedDb}
            >
              {t('create-table')}
            </RawCreateButton>
            {props.selectedDb !== '' ? (
              <ListBox>
                <SearchWrapper>
                  <SearchField
                    placeholder={t('filter-tables')}
                    style={{ width: '100%' }}
                    fullWidth
                    clearable={{
                      callback: () => setTableSearch(''),
                    }}
                    onChange={(val) => setTableSearch(val.currentTarget.value)}
                  />
                </SearchWrapper>
                <Menu>
                  {selectedDBTables?.length ? (
                    selectedDBTables.map((table, index) => (
                      <Menu.Item
                        data-testid="raw-table"
                        key={`${props.selectedDb}/${table.name || ''}`}
                        style={{
                          borderBottom: '1px solid var(--cogs-border--muted)',
                          fontWeight: 'bold',
                          borderRadius: 0,
                        }}
                        onClick={() => {
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
                          onChange={(e) => {
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
                            content={t('view-or-ingest-data-to-this-raw-table')}
                            appendTo={getContainer}
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
                      </Menu.Item>
                    ))
                  ) : (
                    <div style={{ paddingTop: '20%' }}>
                      <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
                        {t('no-tables-in-this-database')}
                      </p>
                    </div>
                  )}
                </Menu>
              </ListBox>
            ) : (
              <ListBox>
                <div style={{ paddingTop: '20%' }}>
                  <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
                    {t('select-database-to-view-tables-in')}
                  </p>
                </div>
              </ListBox>
            )}
          </Col>
          <Col span={24} style={{ marginTop: '10px' }}>
            <div className="resource-table">
              <Table
                css={{ marginBottom: '20px' }}
                pageSize={4}
                columns={selectionColumns as any}
                dataSource={props.selectedTables}
                rowKey={(record: RawTable) =>
                  `${record.databaseName}/${record.tableName}`
                }
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RawSelector;
