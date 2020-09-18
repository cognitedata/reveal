import React, { useContext, useEffect, useReducer, useState } from 'react';
import { DataTransferObject } from 'typings/interfaces';
import { Checkbox, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Button, Dropdown, Icon, Menu, Colors } from '@cognite/cogs.js';
import ApiContext from 'contexts/ApiContext';
import AuthContext from 'contexts/AuthContext';
import APIErrorContext from 'contexts/APIErrorContext';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import { ContentContainer, TableActions } from '../../elements';
import { ExpandRowIcon, StatusDot } from './elements';
import Revisions from './Revisions';
import 'antd/dist/antd.css';
import config from './datatransfer.config';
import DetailView, {
  DetailDataProps,
} from '../../components/Organisms/DetailView/DetailView';
import ErrorMessage from '../../components/Molecules/ErrorMessage';
import { getMappedColumnName } from './utils';

enum ProgressState {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

enum Action {
  LOAD = 'load',
  SUCCEED = 'succeed',
  FAIL = 'fail',
  ADD_COLUMN = 'add_column',
  REMOVE_COLUMN = 'remove_column',
}

type DataTransfersError = {
  message: string;
  status: number;
};

interface Data {
  data: DataTransferObject[];
  rawColumns: ColumnsType<DataTransferObject>;
  allColumnNames: string[];
  selectedColumnNames: string[];
  columns: ColumnsType<DataTransferObject>;
}

interface DataTransfersState {
  status: ProgressState;
  data: Data;
  error: DataTransfersError | undefined;
}

type DataTransfersAction =
  | { type: Action.LOAD }
  | { type: Action.SUCCEED; payload?: Data }
  | { type: Action.FAIL; error: DataTransfersError };

type UserAction =
  | { type: Action.ADD_COLUMN; payload: string }
  | { type: Action.REMOVE_COLUMN; payload: string };

const initialDataTransfersState: DataTransfersState = {
  status: ProgressState.LOADING,
  data: {
    data: [],
    rawColumns: [],
    allColumnNames: [],
    selectedColumnNames: [],
    columns: [],
  },
  error: undefined,
};

function selectColumns(
  dataTransferObjects: DataTransferObject[],
  columnNames: string[]
): ColumnsType<DataTransferObject> {
  const results: ColumnsType<DataTransferObject> = [];
  Object.keys(dataTransferObjects[0]).forEach((key) => {
    if (
      (columnNames.length === 0 || columnNames.includes(key)) &&
      !config.ignoreColumns.includes(key)
    ) {
      results.push({
        title: getMappedColumnName(key),
        dataIndex: key,
        key,
        sorter: !config.nonSortableColumns.includes(key)
          ? (a, b) => (a[key] < b[key] ? -1 : 1)
          : false,
        filters: config.filterableColumns.includes(key)
          ? createFiltersArrayForColumn(dataTransferObjects, key)
          : undefined,
        onFilter: (value, record) => {
          return record[key]?.includes(value);
        },
        width: key === 'status_ok' ? 70 : undefined,
        render: (value) => {
          if (key === 'status_ok') {
            return (
              <StatusDot
                bgColor={value ? Colors.success.hex() : Colors.danger.hex()}
              />
            );
          }
          if (key === 'report') {
            return <div>{value ? 'Success' : 'Error'}</div>;
          }
          return value;
        },
      });
    }
  });
  return results;
}

function DataTransfersReducer(
  state: DataTransfersState,
  action: DataTransfersAction | UserAction
) {
  switch (action.type) {
    case Action.LOAD: {
      return {
        ...state,
        status: ProgressState.LOADING,
      };
    }
    case Action.SUCCEED: {
      return {
        ...state,
        status: ProgressState.SUCCESS,
        data: { ...state.data, ...action.payload },
      };
    }
    case Action.FAIL: {
      return {
        ...state,
        status: ProgressState.ERROR,
        error: action.error,
      };
    }
    case Action.ADD_COLUMN: {
      const tmp = [...state.data!.selectedColumnNames];
      tmp.push(action.payload);
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    case Action.REMOVE_COLUMN: {
      const tmp = [...state.data.selectedColumnNames];
      tmp.splice(tmp.indexOf(action.payload), 1);
      return {
        ...state,
        data: {
          ...state.data,
          selectedColumnNames: tmp,
          columns: selectColumns(state.data.data, tmp),
        },
      };
    }
    default: {
      return state;
    }
  }
}

const SelectColumnsMenu = ({
  columnNames,
  selectedColumnNames,
  onChange,
}: {
  columnNames: string[];
  selectedColumnNames: string[];
  onChange: (e: CheckboxChangeEvent) => void;
}) => {
  return (
    <Menu>
      {columnNames.sort().map((name) => {
        if (config.ignoreColumns.includes(name)) {
          return null;
        }
        return (
          <Menu.Item key={name}>
            <Checkbox
              name={name}
              id={name}
              onChange={onChange}
              checked={selectedColumnNames.includes(name)}
              disabled={config.mandatoryColumns.includes(name)}
            >
              {name === 'status_ok' ? 'Status' : getMappedColumnName(name)}
            </Checkbox>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};

function getAllValuesFromColumn(
  dataSet: DataTransferObject[],
  columnName: string
): string[] {
  const results: string[] = [];
  dataSet.forEach((row) => results.push(row[columnName]));
  return results;
}

function getDistinctValuesFromStringArray(values: string[]): string[] {
  return values.filter(
    (value, index) => value !== null && values.indexOf(value) === index
  );
}

function createFiltersArrayForColumn(
  dataSet: DataTransferObject[],
  columnName: string
): { text: string; value: string }[] {
  const results: { text: string; value: string }[] = [];
  const all: string[] = getAllValuesFromColumn(dataSet, columnName);
  const distinct: string[] = getDistinctValuesFromStringArray(all);
  distinct.sort().forEach((value) =>
    results.push({
      text: value,
      value,
    })
  );
  return results;
}

const DataTransfers: React.FC = () => {
  const [{ status, data, error }, dispatch] = useReducer(
    DataTransfersReducer,
    initialDataTransfersState
  );

  const { api } = useContext(ApiContext);
  const { token } = useContext(AuthContext);
  const { addError } = useContext(APIErrorContext);

  const [
    selectedTransfer,
    setSelectedTransfer,
  ] = useState<DetailDataProps | null>(null);

  function getColumnNames(dataTransferObjects: DataTransferObject[]): string[] {
    const results: string[] = [];
    Object.keys(dataTransferObjects[0]).forEach((k) => {
      results.push(k);
    });
    return results;
  }

  function updateColumnSelection(event: CheckboxChangeEvent) {
    const columnName = event.target.name;
    if (columnName === undefined) return;
    if (event.target.checked) {
      dispatch({ type: Action.ADD_COLUMN, payload: columnName });
    } else {
      dispatch({ type: Action.REMOVE_COLUMN, payload: columnName });
    }
  }

  function handleOpenDetailClick(
    sourceObj: DataTransferObject,
    revision: DataTransferObject
  ) {
    setSelectedTransfer({
      isLoading: true,
      id: sourceObj.id,
      source: {},
      targets: [],
    });
    const selectedObject: DetailDataProps = {
      id: sourceObj.id,
      source: {},
      targets: [],
    };

    api!.objects
      .getDatatransfersForRevision(sourceObj.id, revision.revision)
      .then((response) => {
        if (response) {
          const selectedRevision = response.source.revisions.find(
            (rev: any) => rev.revision === revision.revision
          );
          selectedObject.source = {
            name: response.source.name,
            externalId: response.source.external_id,
            crs: response.source.crs,
            dataType: response.source.datatype,
            createdTime:
              response.source_created_time || response.source.created_time,
            repository: response.source.project,
            businessTag: response.source.business_tags.join(', '),
            revision: selectedRevision.revision,
            revisionSteps: selectedRevision.steps,
            interpreter: response.source.author,
          };
          if (response.targets && response.targets.length > 0) {
            selectedObject.targets = response.targets.map(
              (item: DataTransferObject) => ({
                name: item.name,
                crs: item.crs,
                dataType: item.datatype,
                createdTime: item.created_time,
                repository: item.project,
                revision: item.revisions[item.revisions.length - 1].revision,
                revisionSteps: item.revisions[item.revisions.length - 1].steps,
              })
            );
          }
          selectedObject.isLoading = false;
        }
        setSelectedTransfer(selectedObject);
      });
  }

  useEffect(() => {
    function fetchDataTransfers() {
      dispatch({ type: Action.LOAD });
      api!.objects
        .get()
        .then((response: DataTransferObject[]) => {
          if (!response[0].error) {
            const handledData = response.map((item) => ({
              ...item,
              report: item.status_ok,
            }));
            dispatch({
              type: Action.SUCCEED,
              payload: {
                data: handledData,
                columns: selectColumns(
                  handledData,
                  config.initialSelectedColumnNames
                ),
                rawColumns: selectColumns(handledData, []),
                allColumnNames: getColumnNames(handledData),
                selectedColumnNames: config.initialSelectedColumnNames,
              },
            });
          } else {
            throw new Error(response[0].status);
          }
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
          dispatch({ type: Action.FAIL, error: err });
        });
    }
    if (token && token !== 'NO_TOKEN') {
      fetchDataTransfers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch transfers - ${error.message}`}
        fullView
      />
    );
  }

  function renderExpandedRow(record: DataTransferObject) {
    return <Revisions record={record} onDetailClick={handleOpenDetailClick} />;
  }

  return (
    <ContentContainer>
      <TableActions>
        <Dropdown
          content={
            <SelectColumnsMenu
              columnNames={data.allColumnNames}
              selectedColumnNames={data.selectedColumnNames}
              onChange={updateColumnSelection}
            />
          }
        >
          <Button
            type="link"
            size="small"
            style={{ color: 'var(--cogs-greyscale-grey7)' }}
          >
            <Icon type="Settings" />
          </Button>
        </Dropdown>
      </TableActions>
      <Table
        dataSource={data.data}
        columns={sortBy(data.columns, (obj) =>
          indexOf(config.columnOrder, obj.key)
        )}
        loading={status === ProgressState.LOADING}
        rowKey="id"
        key={data.selectedColumnNames.join('')}
        expandable={{
          expandedRowRender: renderExpandedRow,
          // eslint-disable-next-line react/prop-types
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <ExpandRowIcon type="Down" onClick={(e) => onExpand(record, e)} />
            ) : (
              <ExpandRowIcon
                type="Right"
                onClick={(e) => onExpand(record, e)}
              />
            ),
        }}
      />
      <DetailView
        onClose={() => setSelectedTransfer(null)}
        data={selectedTransfer}
      />
    </ContentContainer>
  );
};

export default DataTransfers;
