import React, { useState, useEffect, useMemo, useContext } from 'react';
import sdk from 'utils/sdkSingleton';
import Table from 'antd/lib/table';
import Spin from 'antd/lib/spin';
import Alert from 'antd/lib/alert';
import { Button } from '@cognite/cogs.js';
import Popconfirm from 'antd/lib/popconfirm';
import InputNumber from 'antd/lib/input-number';
import message from 'antd/lib/message';
import Typography from 'antd/lib/typography';
import AccessButton from 'components/AccessButton';
import moment from 'moment';
import styled from 'styled-components';
import isString from 'lodash/isString';
import {
  stringCompare,
  escapeCSVValue,
  toLocalDate,
  toLocalTime,
  getContainer,
} from 'utils/utils';
import Tooltip from 'antd/lib/tooltip';
import { CSVLink } from 'react-csv';
import { dateSorter } from 'utils/typedUtils';
import { useRouteMatch } from 'react-router-dom';
import handleError from 'utils/handleError';
import { RawExplorerContext } from 'contexts';
import UploadCSV from '../UploadCSV';

const { Text } = Typography;
interface TableContentProps {
  deleteTable(databaseName?: string, tableName?: string): void;
  isFetching: boolean;
  setIsFetching(value: boolean): void;
  hasWriteAccess: boolean;
}

const showTotalItems = (total: number) => {
  return `Total ${total} rows`;
};
const CardHeading = styled.div`
  border-bottom: 1px solid #d8d8d8;
  padding-top: 4px;
  padding-left: 10px;
`;

const TableTimeStamp = styled.span`
  font-size: 14px;
  text-align: right;
  float: right;
  margin-right: 5px;
  font-weight: initial;
`;

const TableContent = ({
  deleteTable,
  isFetching,
  setIsFetching,
  hasWriteAccess,
}: TableContentProps) => {
  const match = useRouteMatch<{
    dbName?: string;
    tableName?: string;
  }>('/:project/raw-explorer/:dbName/:tableName');
  const dbName = match?.params.dbName;
  const tableName = match?.params.tableName;

  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);
  const [limitExceeded, setLimitHasExceeded] = useState<boolean>(false);

  const {
    fetchLimit,
    setFetchLimit,
    isFetchingTableData,
    setIsFetchingTableData,
    tableData,
    setTableData,
  } = useContext(RawExplorerContext);

  const downloadData = useMemo(() => {
    if (tableData.length)
      return (
        tableData.map((item) => {
          const escapedColumns: Record<string, string> = {};
          Object.keys(item.columns).forEach((key) => {
            escapedColumns[key] = escapeCSVValue(item.columns[key]);
          });
          return { key: item.key, ...escapedColumns };
        }) || []
      );
    return [];
  }, [tableData]);

  const getLatestUpdateTime = () => {
    const dataCopy = tableData.slice(0);
    dataCopy.sort(dateSorter((x) => x.lastUpdatedTime.toLocaleTimeString()));

    if (dataCopy && dataCopy[0]) {
      return (
        <TableTimeStamp>
          Last update time : {toLocalDate(dataCopy[0].lastUpdatedTime)}{' '}
          {toLocalTime(dataCopy[0].lastUpdatedTime)}
        </TableTimeStamp>
      );
    }
    if (isFetching || isFetchingTableData) {
      return (
        <span style={{ textAlign: 'right', float: 'right' }}>
          <Spin />
        </span>
      );
    }
    return <TableTimeStamp>Last update time : N/A</TableTimeStamp>;
  };

  const renderNestedObject = (value: object) => {
    return (
      <Tooltip
        title={JSON.stringify(value)}
        key={JSON.stringify(value)}
        getPopupContainer={getContainer}
      >
        {JSON.stringify(value)}
      </Tooltip>
    );
  };

  const renderArray = (value: any[]): React.ReactElement => {
    return (
      <Tooltip
        title={
          <div>
            <strong>List: </strong>
            {value.map((a) =>
              typeof a === 'object' ? ( // eslint-disable-line
                chooseRenderType(a)
              ) : (
                <span style={{ marginLeft: '2px' }}>{a}</span>
              )
            )}
          </div>
        }
        getPopupContainer={getContainer}
      >
        <p
          style={{ maxHeight: '150px', overflow: 'hidden' }}
          key={value.toString()}
        >
          <strong>List: </strong>
          {value.map((a) =>
            typeof a === 'object' ? ( // eslint-disable-line
              chooseRenderType(a)
            ) : (
              <span style={{ marginLeft: '2px' }}>{a}</span>
            )
          )}
        </p>
      </Tooltip>
    );
  };

  const checkIfLimitIsMax = (limit: number) => {
    if (limit > 10000) {
      setLimitHasExceeded(true);
      if (!limitExceeded) {
        message.warning(
          'Please note that the maximum allowed fetch limit is 10,000'
        );
      }
      setFetchLimit(10000);
    } else {
      setFetchLimit(limit);
    }
  };

  const chooseRenderType = (value: any) => {
    // eslint-disable-next-line
    if (typeof value === 'boolean') {
      return (
        <p style={{ maxHeight: '150px', overflow: 'hidden' }}>
          {value.toString()}
        </p>
      );
    }
    // eslint-disable-next-line
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return renderArray(value);
      }
      return renderNestedObject(value);
    }
    return (
      <Tooltip title={value} getPopupContainer={getContainer}>
        <p style={{ maxHeight: '150px', overflow: 'hidden' }}>{value}</p>
      </Tooltip>
    );
  };

  const getSortFunction = (itemA: any, itemB: any) => {
    // eslint-disable-next-line
    if (typeof itemA === 'string') {
      if (Number(itemA) - Number(itemB)) {
        return Number(itemA) - Number(itemB);
      }
      return stringCompare(itemA, itemB);
    }
    if (itemA && itemA.getMonth) {
      return moment(itemA).isBefore(itemB);
    }
    // eslint-disable-next-line
    if (typeof itemA === 'object') {
      if (Array.isArray(itemA)) {
        return itemA.length === itemB.length;
      }
      return false;
    }
    return Number(itemA) - Number(itemB);
  };

  const getColumns = () => {
    const columns: any[] = [];
    columns.push(
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        width: 250,
        columnWidth: 250,
        sorter: (a: any, b: any) => {
          if (isString(a.key)) {
            return a.key.localeCompare(b.key);
          }
          return a.key - b.key;
        },
        render: (text: any) => (
          <div>
            <Tooltip title={text} getPopupContainer={getContainer}>
              {text}
            </Tooltip>
          </div>
        ),
      },
      {
        title: 'Last update time',
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        width: 250,
        columnWidth: 250,
        sorter: (a: any, b: any) =>
          moment(a.lastUpdatedTime).isBefore(b.lastUpdatedTime),
        render: (text: any) => (
          <p>
            {toLocalDate(text)} <br /> {toLocalTime(text)}
          </p>
        ),
      }
    );

    const rows = tableData.slice(
      0,
      tableData.length < 100 ? tableData.length : 100
    );
    const columnsSet = new Set(
      rows
        .map((row) => Object.keys(row.columns))
        .reduce((accumulator, value) => accumulator.concat(value), [])
    );
    columnsSet.forEach((column) => {
      columns.push({
        title: (
          <div
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <Tooltip title={column} getPopupContainer={getContainer}>
              {column}
            </Tooltip>
          </div>
        ),
        ellipsis: {
          showTitle: false,
        },
        width: 250,
        columnWidth: 250,
        dataIndex: column,
        key: column.toString(),
        render: (value: any) => (
          <div style={{ maxWidth: 200 }}>{chooseRenderType(value)}</div>
        ),
        sorter: (a: any, b: any) => getSortFunction(a[column], b[column]),
        sortDirections: ['descend', 'ascend'],
      });
    });
    return columns;
  };

  const getData = () => {
    const data: any[] = [];
    tableData.forEach((table) => {
      data.push({
        ...table.columns,
        key: table.key,
        lastUpdatedTime: table.lastUpdatedTime,
      });
    });
    return data;
  };

  useEffect(() => {
    const fetchTableContent = async (db: string, tb: string) => {
      try {
        setIsFetchingTableData(true);
        const list = await sdk.raw
          .listRows(unescape(db), unescape(tb))
          .autoPagingToArray({ limit: fetchLimit });
        setTableData(list);
        setIsFetchingTableData(false);
      } catch (e) {
        handleError(e);
        setIsFetchingTableData(false);
      }
    };

    if (dbName && tableName) {
      fetchTableContent(dbName, tableName);
    }
  }, [fetchLimit, tableName, dbName, setIsFetchingTableData, setTableData]);

  return (
    <div>
      {!tableName ? (
        <CardHeading style={{ borderBottom: '0' }}>
          <Alert
            style={{ height: '35px' }}
            message="Please select a table to view"
            type="info"
            showIcon
          />
        </CardHeading>
      ) : (
        <>
          <CardHeading>
            <h3>
              Table: {unescape(tableName)}
              <span style={{ textAlign: 'right' }}>
                {getLatestUpdateTime()}
              </span>
            </h3>
          </CardHeading>

          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Text>
              Number of rows to fetch{' '}
              <InputNumber
                aria-label="Number of rows to fetch"
                min={1}
                max={10000}
                defaultValue={fetchLimit}
                style={{ margin: '10px' }}
                onChange={(value) => checkIfLimitIsMax(Number(value))}
              />
            </Text>
            <AccessButton
              permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
              hasWriteAccess={hasWriteAccess}
              type="primary"
              icon="Upload"
              onClick={() => setCSVModalVisible(true)}
              style={{
                marginLeft: '5px',
                marginRight: '5px',
              }}
            >
              Upload CSV
            </AccessButton>
            <Tooltip
              title={
                !hasWriteAccess ? (
                  <p>
                    To create, edit, or delete tables and databases in RAW, you
                    need the access management capability{' '}
                    <strong>raw:write</strong>
                  </p>
                ) : (
                  ''
                )
              }
              getPopupContainer={getContainer}
            >
              <Popconfirm
                title="Are you sure you want to delete this table? Once deleted, the table cannot be recovered."
                onConfirm={() => deleteTable(dbName, tableName)}
                okText="Yes"
                cancelText="No"
                disabled={!hasWriteAccess}
                cancelButtonProps={{ type: 'default' }}
              >
                <Button
                  type="danger"
                  icon="Trash"
                  style={{ marginRight: '5px' }}
                  disabled={!hasWriteAccess}
                >
                  Delete Table
                </Button>
              </Popconfirm>
            </Tooltip>
            {tableData.length > 0 && (
              <CSVLink
                filename={`cognite-${dbName}-${tableName}.csv`}
                data={downloadData}
              >
                <Button type="primary" icon="Download">
                  Download CSV
                </Button>
              </CSVLink>
            )}
          </div>

          <Table
            loading={isFetching || isFetchingTableData}
            bordered
            columns={tableData ? getColumns() : []}
            dataSource={tableData ? getData() : []}
            scroll={{ x: 'max-content' }}
            pagination={{
              showSizeChanger: true,
              defaultPageSize: 10,
              showTotal: showTotalItems,
              size: 'default',
              pageSizeOptions: ['5', '10', '20', '30', '40', '50'],
            }}
            getPopupContainer={getContainer}
            locale={{
              emptyText: (
                <Alert
                  message="The table you selected contains no data. To get data in, either upload a CSV file or write your own code to ingest data into this table."
                  type="info"
                  showIcon
                />
              ),
            }}
          />
        </>
      )}
      {tableName && dbName && (
        <UploadCSV
          csvModalVisible={csvModalVisible}
          setCSVModalVisible={setCSVModalVisible}
          table={tableName}
          database={dbName}
          isFetching={isFetching}
          setIsFetching={setIsFetching}
          tableData={tableData}
        />
      )}
    </div>
  );
};

export default TableContent;
