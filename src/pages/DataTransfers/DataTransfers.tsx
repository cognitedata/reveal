import React, { useContext, useEffect, useReducer, useState } from 'react';
import { format } from 'date-fns';
import set from 'date-fns/set';
import {
  DataTransferObject,
  GenericResponseObject,
  RESTConfigurationsFilter,
  RESTTransfersFilter,
  RevisionObject,
  SelectedDateRangeType,
} from 'typings/interfaces';
import { Checkbox, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Colors,
  Tooltip,
} from '@cognite/cogs.js';
import ApiContext from 'contexts/ApiContext';
import AuthContext from 'contexts/AuthContext';
import APIErrorContext from 'contexts/APIErrorContext';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { ContentContainer } from '../../elements';
import {
  TableActions,
  ColumnsSelector,
  ExpandRowIcon,
  StatusDot,
  DetailViewWrapper,
} from './elements';
import Revisions from './Revisions';
import 'antd/dist/antd.css';
import config from './datatransfer.config';
import DetailView, {
  DetailDataProps,
} from '../../components/Organisms/DetailView/DetailView';
import ErrorMessage from '../../components/Molecules/ErrorMessage';
import { getMappedColumnName, getFormattedTimestampOrString } from './utils';
import Filters from './Filters';

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
        width: key === 'status' ? 70 : undefined,
        render: (value) => {
          if (key === 'status') {
            let color = Colors.yellow.hex();
            if (value.toLowerCase() === 'failed') {
              color = Colors.danger.hex();
            } else if (value.toLowerCase() === 'succeeded') {
              color = Colors.success.hex();
            }
            return <StatusDot bgColor={color} />;
          }
          return getFormattedTimestampOrString(value);
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
      const tmp = [action.payload, ...state.data!.selectedColumnNames];
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
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<GenericResponseObject[]>(
    []
  );
  const [
    selectedConfiguration,
    setSelectedConfiguration,
  ] = useState<GenericResponseObject | null>(null);
  const [sourceProjects, setSourceProjects] = useState<DataTransferObject[]>(
    []
  );
  const [
    selectedSourceProject,
    setSelectedSourceProject,
  ] = useState<DataTransferObject | null>(null);
  const [targetProjects, setTargetProjects] = useState<DataTransferObject[]>(
    []
  );
  const [
    selectedTargetProject,
    setSelectedTargetProject,
  ] = useState<DataTransferObject | null>(null);
  const [
    selectedDateRange,
    setSelectedDateRange,
  ] = useState<SelectedDateRangeType | null>(null);
  const [datatypes, setDatatypes] = useState<string[]>([]);
  const [selectedDatatype, setSelectedDatatype] = useState<string | null>(null);

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

  function fetchDataTransfers() {
    if (
      selectedSource &&
      selectedSourceProject &&
      selectedTarget &&
      selectedTargetProject
    ) {
      dispatch({ type: Action.LOAD });
      const options: RESTTransfersFilter = {
        source: {
          source: selectedSource,
          external_id: selectedSourceProject.external_id,
        },
        target: {
          source: selectedTarget,
          external_id: selectedTargetProject.external_id,
        },
      };
      if (selectedDateRange) {
        let after = selectedDateRange[0];
        let before = selectedDateRange[1];
        if (after && before) {
          after = set(after, { hours: 0, minutes: 0, seconds: 0 });
          before = set(before, { hours: 23, minutes: 59, seconds: 59 });
          options.updated_after = Number(format(after, 't'));
          options.updated_before = Number(format(before, 't'));
        }
      }
      if (selectedConfiguration) {
        options.configuration = selectedConfiguration.name;
      }
      if (selectedDatatype) {
        options.datatypes = [selectedDatatype];
      }
      api!.datatransfers
        .get(options)
        .then((response: DataTransferObject[]) => {
          if (response.length > 0) {
            if (!response[0].error) {
              const handledData = response.map((item) => ({
                ...item.source,
                status: item.status,
                report: item.status,
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
          } else {
            dispatch({
              type: Action.SUCCEED,
              payload: initialDataTransfersState.data,
            });
          }
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
          dispatch({ type: Action.FAIL, error: err });
        });
    }
  }

  function fetchProjects() {
    dispatch({ type: Action.LOAD });
    if (selectedSource) {
      api!.projects
        .get(selectedSource)
        .then((response) => {
          if (response.length > 0) {
            if (!response[0].error) {
              setSourceProjects(response);
            } else {
              throw new Error(response[0].status);
            }
          }
          dispatch({ type: Action.SUCCEED });
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
        });
    }
    if (selectedTarget) {
      api!.projects
        .get(selectedTarget)
        .then((response) => {
          if (response.length > 0) {
            if (!response[0].error) {
              setTargetProjects(response);
            } else {
              throw new Error(response[0].status);
            }
            dispatch({ type: Action.SUCCEED });
          }
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
        });
    }
  }

  function fetchDatatypes() {
    if (selectedSourceProject) {
      api!.datatypes
        .get(selectedSourceProject.id)
        .then((response: string[]) => {
          setDatatypes(response);
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
        });
    }
  }

  function fetchConfigurations() {
    if (
      selectedSource &&
      selectedSourceProject &&
      selectedTarget &&
      selectedTargetProject
    ) {
      const options: RESTConfigurationsFilter = {
        source: {
          source: selectedSource,
          external_id: selectedSourceProject.external_id,
        },
        target: {
          source: selectedTarget,
          external_id: selectedTargetProject.external_id,
        },
      };
      if (selectedDatatype) {
        options.datatypes = [selectedDatatype];
      }
      api!.configurations
        .getFiltered(options)
        .then((response: GenericResponseObject[]) => {
          if (response.length > 0 && !response[0].error) {
            setConfigurations(response);
          } else if (response.length === 0) {
            setConfigurations([]);
          } else {
            throw new Error(response[0].status);
          }
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
        });
    }
  }

  function handleOpenDetailClick(
    sourceObj: DataTransferObject,
    revision: RevisionObject
  ) {
    setSelectedTransfer({
      isLoading: true,
      id: sourceObj.id,
      source: {},
      target: {},
    });
    const selectedObject: DetailDataProps = {
      id: sourceObj.id,
      source: {
        name: sourceObj.name,
        externalId: sourceObj.external_id,
        crs: sourceObj.crs,
        dataType: sourceObj.datatype,
        createdTime: sourceObj.source_created_time || sourceObj.created_time,
        repository: sourceObj.project,
        businessTag: sourceObj.business_tags.join(', '),
        revision: revision.revision,
        revisionSteps: revision.steps,
        interpreter: sourceObj.author,
      },
      target: {},
    };
    const translation = revision.translations[revision.translations.length - 1];
    api!.objects
      .getSingleObject(translation.revision.object_id)
      .then((response) => {
        if (response && response.length > 0 && !response[0].error) {
          const item = response[0];
          selectedObject.target = {
            name: item.name,
            crs: item.crs,
            dataType: item.datatype,
            createdTime: translation.revision.created_time,
            repository: item.project,
            revision: translation.revision.revision,
            revisionSteps: translation.revision.steps,
          };
          selectedObject.isLoading = false;
        }
        setSelectedTransfer(selectedObject);
      });
  }

  useEffect(() => {
    dispatch({ type: Action.LOAD });
    function fetchSources() {
      api!.sources
        .get()
        .then((response: string[]) => {
          setSources(response);
          dispatch({ type: Action.SUCCEED });
        })
        .catch((err: DataTransfersError) => {
          addError(err.message, parseInt(err.message, 10));
          dispatch({ type: Action.FAIL, error: err });
        });
    }

    if (token && token !== 'NO_TOKEN') {
      fetchSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      setSelectedSourceProject(null);
      setSelectedTarget(null);
      setSelectedTargetProject(null);
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchDatatypes();
      setSelectedTarget(null);
      setSelectedTargetProject(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceProject]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchProjects();
      setSelectedTargetProject(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchDataTransfers();
      fetchConfigurations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTargetProject]);

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchDataTransfers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange, selectedConfiguration]);

  useEffect(() => {
    setSelectedConfiguration(null);
    if (token && token !== 'NO_TOKEN') {
      fetchConfigurations();
      fetchDataTransfers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatatype]);

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

  function getNoDataText() {
    let message = 'Select source';
    if (selectedSource) {
      if (selectedSourceProject) {
        if (selectedTarget) {
          if (selectedTargetProject) {
            message = 'No data';
          } else {
            message = 'Select target project';
          }
        } else {
          message = 'Select target';
        }
      } else {
        message = 'Select source project';
      }
    }

    return (
      <EmptyTableMessage
        text={message}
        isLoading={status === ProgressState.LOADING}
      />
    );
  }

  if (!sources) {
    return null;
  }

  return (
    <ContentContainer>
      <TableActions>
        {sources.length > 0 && (
          <Filters
            source={{
              sources,
              selected: selectedSource,
              onSelectSource: (nextSelected) => setSelectedSource(nextSelected),
              projects: sourceProjects,
              selectedProject: selectedSourceProject,
              onSelectProject: (nextSelected) =>
                setSelectedSourceProject(nextSelected),
            }}
            target={{
              targets: sources,
              selected: selectedTarget,
              onSelectTarget: (nextSelected) => setSelectedTarget(nextSelected),
              projects: targetProjects,
              selectedProject: selectedTargetProject,
              onSelectProject: (nextSelected) =>
                setSelectedTargetProject(nextSelected),
            }}
            configuration={{
              configurations,
              selected: selectedConfiguration,
              onSelectConfiguration: (nextSelected) =>
                setSelectedConfiguration(nextSelected),
            }}
            datatype={{
              types: datatypes,
              selected: selectedDatatype,
              onSelectType: (nextSelected) => setSelectedDatatype(nextSelected),
            }}
            date={{
              selectedRange: selectedDateRange,
              onSelectDate: (nextSelected) =>
                setSelectedDateRange(nextSelected),
            }}
          />
        )}
        {data.data.length > 0 && (
          <ColumnsSelector>
            <Tooltip content="Show/hide table columns">
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
                  style={{ marginTop: '0.3rem' }}
                  aria-label="Show/hide table columns"
                >
                  <Icon type="Settings" />
                </Button>
              </Dropdown>
            </Tooltip>
          </ColumnsSelector>
        )}
      </TableActions>
      <Table
        dataSource={data.data}
        columns={sortBy(data.columns, (obj) =>
          indexOf(config.columnOrder, obj.key)
        )}
        rowKey="id"
        key={`${data.selectedColumnNames.join('')}_${selectedSource}_${
          // eslint-disable-next-line camelcase
          selectedSourceProject?.external_id
          // eslint-disable-next-line camelcase
        }_${selectedTarget}_${selectedTargetProject?.external_id}`}
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
        locale={{
          emptyText: getNoDataText(),
        }}
      />
      <DetailViewWrapper>
        <DetailView
          onClose={() => setSelectedTransfer(null)}
          data={selectedTransfer}
        />
      </DetailViewWrapper>
    </ContentContainer>
  );
};

export default DataTransfers;
