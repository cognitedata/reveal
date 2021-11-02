import React, { useState, useEffect, useMemo, useCallback } from 'react';

import {
  notification,
  Table,
  Alert,
  Popconfirm,
  InputNumber,
  Typography,
  Tooltip,
} from 'antd';

import { Button, Icon } from '@cognite/cogs.js';

import AccessButton from 'components/AccessButton';

import styled from 'styled-components';
import isString from 'lodash/isString';
import {
  stringCompare,
  escapeCSVValue,
  toLocalDate,
  toLocalTime,
  getContainer,
} from 'utils/utils';
import { CSVLink } from 'react-csv';
import { useHistory, useParams } from 'react-router-dom';

import { useDeleteTable, useTableRows } from 'hooks/sdk-queries';
import { RawDBRow } from '@cognite/sdk';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { createLink } from '@cognite/cdf-utilities';
import UploadCSV from '../UploadCSV';

const { Text } = Typography;

const showTotalItems = (total: number) => {
  return `Total ${total} rows`;
};
const CardHeading = styled.div`
  border-bottom: 1px solid #d8d8d8;
  padding-top: 4px;
  padding-left: 10px;
`;

const TableContent = () => {
  const history = useHistory();
  const { database, table } = useParams<{
    project: string;
    table?: string;
    database?: string;
  }>();

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { mutate: deleteTable } = useDeleteTable();

  const [fetchLimit, setFetchLimit] = useState(25);
  const enabled = !!database && !!table;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetched,
    isFetching,
    isError: rowError,
    refetch,
  } = useTableRows(
    {
      database: database!,
      table: table!,
      pageSize: 100,
    },
    { enabled }
  );

  const done: boolean =
    !!data &&
    data.pages.reduce((accl, p) => accl + p.items.length, 0) > fetchLimit;

  const rows = useMemo(() => {
    if (data) {
      return data.pages
        .reduce((accl, page) => [...accl, ...page.items], [] as RawDBRow[])
        .slice(0, fetchLimit);
    }
    return [];
  }, [data, fetchLimit]);

  const flatRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        ...row.columns,
      })),
    [rows]
  );

  useEffect(() => {
    if (
      !done &&
      !isFetching &&
      isFetched &&
      enabled &&
      !rowError &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [
    done,
    fetchNextPage,
    isFetching,
    isFetched,
    enabled,
    rowError,
    hasNextPage,
  ]);

  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);
  const [limitExceeded, setLimitHasExceeded] = useState<boolean>(false);

  useEffect(() => {
    if (!csvModalVisible && isFetched && enabled) {
      refetch();
    }
  }, [csvModalVisible, isFetched, refetch, enabled]);

  const downloadData = useMemo(() => {
    if (!done) {
      return [];
    }
    if (rows.length)
      return (
        rows.map((item) => {
          const escapedColumns: Record<string, string> = {};
          Object.keys(item.columns).forEach((key) => {
            escapedColumns[key] = escapeCSVValue(item.columns[key]);
          });
          return { key: item.key, ...escapedColumns };
        }) || []
      );
    return [];
  }, [rows, done]);

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

  const chooseRenderType = useCallback((value: any) => {
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
      }
      return renderNestedObject(value);
    }
    return (
      <Tooltip title={value} getPopupContainer={getContainer}>
        <p style={{ maxHeight: '150px', overflow: 'hidden' }}>{value}</p>
      </Tooltip>
    );
  }, []);

  const checkIfLimitIsMax = (limit: number) => {
    if (limit > 10000) {
      setLimitHasExceeded(true);
      if (!limitExceeded) {
        notification.warning({
          message: 'Please note that the maximum allowed fetch limit is 10,000',
          key: 'max-row-limit',
        });
      }
      setFetchLimit(10000);
    } else {
      setFetchLimit(limit);
    }
  };

  const getSortFunction = (itemA: any, itemB: any) => {
    // eslint-disable-next-line
    if (typeof itemA === 'string') {
      if (Number(itemA) - Number(itemB)) {
        return Number(itemA) - Number(itemB);
      }
      return stringCompare(itemA, itemB);
    }
    if (itemA instanceof Date && itemB instanceof Date) {
      return itemA.getTime() - itemB.getTime();
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

  const columnSet = useMemo(() => {
    return new Set(
      data
        ? data.pages[0].items
            .map((row) => Object.keys(row.columns))
            .reduce((accumulator, value) => accumulator.concat(value), [])
        : []
    );
  }, [data]);

  const columns = useMemo(() => {
    const tmpColumns: any[] = [];
    tmpColumns.push(
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
        sorter: (a: RawDBRow, b: RawDBRow) =>
          a.lastUpdatedTime.getTime() - b.lastUpdatedTime.getTime(),
        render: (text: any) => (
          <p>
            {toLocalDate(text)} <br /> {toLocalTime(text)}
          </p>
        ),
      }
    );

    columnSet.forEach((column) => {
      tmpColumns.push({
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
    return tmpColumns;
  }, [chooseRenderType, columnSet]);

  if (rowError) {
    return <Alert type="error" message="Table not found" />;
  }

  return (
    <div>
      {!table ? (
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
              Table: {unescape(table)}
              <span style={{ textAlign: 'right', float: 'right' }}>
                {isFetching ? <Icon type="Loading" /> : undefined}
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
                onConfirm={() =>
                  deleteTable(
                    { database: database!, table: table! },
                    {
                      onSuccess() {
                        notification.success({
                          message: `Table ${table} in database ${database} deleted!`,
                          key: 'table-created',
                        });
                        history.replace(
                          createLink(`/raw-explorer/${database}`)
                        );
                      },
                      onError(e) {
                        notification.error({
                          message: 'An error occured when deleting the table!',
                          description: <pre>{JSON.stringify(e, null, 2)}</pre>,
                          key: 'table-created',
                        });
                      },
                    }
                  )
                }
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
            <CSVLink
              filename={`cognite-${database}-${table}.csv`}
              data={downloadData}
            >
              <Button type="primary" icon="Download">
                Download CSV
              </Button>
            </CSVLink>
          </div>

          <Table
            loading={isLoading}
            bordered
            columns={columns}
            dataSource={flatRows}
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
      {table && database && (
        <UploadCSV
          csvModalVisible={csvModalVisible}
          setCSVModalVisible={setCSVModalVisible}
          table={table}
          database={database}
        />
      )}
    </div>
  );
};

export default TableContent;
