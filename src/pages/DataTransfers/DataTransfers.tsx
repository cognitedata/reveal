import React, { useContext, useEffect, useReducer, useState } from 'react';
import { format } from 'date-fns';
import set from 'date-fns/set';
import 'antd/dist/antd.css';
import { ColumnsType } from 'antd/es/table';
import { Checkbox, Table } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  Button,
  Dropdown,
  Menu,
  Colors,
  Tooltip,
  Range,
} from '@cognite/cogs.js';

import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import EmptyTableMessage from 'components/Molecules/EmptyTableMessage/EmptyTableMessage';
import { apiStatuses } from 'utils/statuses';
import { useQuery } from 'utils/functions';
import {
  DataTransferObject,
  GenericResponseObject,
  RESTTransfersFilter,
  RevisionObject,
} from 'typings/interfaces';

import { ContentContainer } from '../../elements';
import Revisions from './Revisions';
import config from './datatransfer.config';
import ErrorMessage from '../../components/Molecules/ErrorMessage';
import { getMappedColumnName, getFormattedTimestampOrString } from './utils';
import { Filters } from './Filters';
import DetailView, {
  DetailDataProps,
} from '../../components/Organisms/DetailView/DetailView';
import {
  TableActions,
  ColumnsSelector,
  ExpandRowIcon,
  StatusDot,
  DetailViewWrapper,
} from './elements';
import {
  ProgressState,
  Action,
  DataTransfersError,
  DataTransfersState,
  DataTransfersAction,
  UserAction,
} from './types';

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
  if (dataTransferObjects.length > 0) {
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
          onFilter: (value, record) => record[key]?.includes(value),
          width: key === 'status' ? 70 : undefined,
          render: (value) => {
            if (key === 'status') {
              let color = Colors['greyscale-grey3'].hex();
              if (value === apiStatuses.Failed) {
                color = Colors.danger.hex();
              } else if (value === apiStatuses.Succeeded) {
                color = Colors.success.hex();
              } else if (value === apiStatuses.InProgress) {
                color = Colors.yellow.hex();
              }
              return <StatusDot bgColor={color} />;
            }
            if (key === 'id') {
              return value;
            }
            return getFormattedTimestampOrString(value);
          },
        });
      }
    });
  }
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
}) => (
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

const DataTransfers: React.FC = () => {
  const [{ status, data, error }, dispatch] = useReducer(
    DataTransfersReducer,
    initialDataTransfersState
  );
  const [filteredData, setFilteredData] = useState<DataTransferObject[]>(
    data.data
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
  const [selectedDateRange, setSelectedDateRange] = useState<Range>({});
  const [datatypes, setDatatypes] = useState<string[]>([]);
  const [selectedDatatype, setSelectedDatatype] = useState<string | null>(null);

  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);
  const query = useQuery();
  const configurationNameFromUrl = query.get('configuration');
  const { url } = useRouteMatch();
  const history = useHistory();

  const [
    selectedTransfer,
    setSelectedTransfer,
  ] = useState<DetailDataProps | null>(null);

  function getColumnNames(dataTransferObjects: DataTransferObject[]): string[] {
    const results: string[] = [];
    if (dataTransferObjects.length > 0) {
      Object.keys(dataTransferObjects[0]).forEach((k) => {
        results.push(k);
      });
    }
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

  function clearData() {
    dispatch({
      type: Action.SUCCEED,
      payload: {
        data: [],
        columns: data.columns,
        rawColumns: data.rawColumns,
        allColumnNames: data.allColumnNames,
        selectedColumnNames: data.selectedColumnNames,
      },
    });
  }

  function fetchDataTransfers() {
    if (
      selectedConfiguration ||
      (selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject)
    ) {
      dispatch({ type: Action.LOAD });
      let options: RESTTransfersFilter = {};
      if (
        selectedSource &&
        selectedSourceProject &&
        selectedTarget &&
        selectedTargetProject
      ) {
        options = {
          source: {
            source: selectedSource,
            external_id: selectedSourceProject.external_id,
          },
          target: {
            source: selectedTarget,
            external_id: selectedTargetProject.external_id,
          },
        };
      }
      if (selectedDateRange) {
        let { startDate, endDate } = selectedDateRange;
        if (startDate && endDate) {
          startDate = set(startDate, { hours: 0, minutes: 0, seconds: 0 });
          endDate = set(endDate, { hours: 23, minutes: 59, seconds: 59 });
          options.updated_after = Number(format(startDate, 't'));
          options.updated_before = Number(format(endDate, 't'));
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
                    handledData.length > 0 ? handledData : data.data,
                    data.selectedColumnNames.length > 0
                      ? data.selectedColumnNames
                      : config.initialSelectedColumnNames
                  ),
                  rawColumns: selectColumns(
                    handledData.length > 0 ? handledData : data.data,
                    []
                  ),
                  allColumnNames: getColumnNames(
                    handledData.length > 0 ? handledData : data.data
                  ),
                  selectedColumnNames:
                    data.selectedColumnNames.length > 0
                      ? data.selectedColumnNames
                      : config.initialSelectedColumnNames,
                },
              });
            } else {
              throw new Error(response[0].status);
            }
          } else {
            dispatch({
              type: Action.SUCCEED,
              payload: {
                ...initialDataTransfersState.data,
                columns: selectColumns(
                  data.data,
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames
                ),
                rawColumns: selectColumns(data.data, []),
                allColumnNames: getColumnNames(data.data),
                selectedColumnNames:
                  data.selectedColumnNames.length > 0
                    ? data.selectedColumnNames
                    : config.initialSelectedColumnNames,
              },
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
      isLoading: true,
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
        cdfMetadata: sourceObj.cdf_metadata,
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
            cdfMetadata: item.cdf_metadata,
          };
          selectedObject.isLoading = false;
        }
        setSelectedTransfer(selectedObject);
      });
  }

  useEffect(() => {
    dispatch({
      type: Action.SUCCEED,
      payload: {
        data: [],
        columns: data.columns,
        rawColumns: data.rawColumns,
        allColumnNames: data.allColumnNames,
        selectedColumnNames: config.initialSelectedColumnNames,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: Action.LOAD });
    function fetchConfigurations() {
      api!.configurations
        .get()
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

    fetchConfigurations();
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    setFilteredData(data.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    clearData();
    setSelectedSourceProject(null);
    setSelectedTarget(null);
    setSelectedTargetProject(null);
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource]);

  useEffect(() => {
    clearData();
    fetchDatatypes();
    setSelectedTarget(null);
    setSelectedTargetProject(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceProject]);

  useEffect(() => {
    clearData();
    fetchProjects();
    setSelectedTargetProject(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  useEffect(() => {
    clearData();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget, selectedTargetProject, selectedDateRange]);

  useEffect(() => {
    if (configurationNameFromUrl && configurations.length > 0) {
      const selectedConfig = configurations.find(
        (item) => item.name === configurationNameFromUrl
      );
      if (selectedConfig) {
        setSelectedConfiguration(selectedConfig);
        fetchDatatypes();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configurations]);

  useEffect(() => {
    if (selectedConfiguration) {
      history.push(`${url}?configuration=${selectedConfiguration?.name}`);
    } else {
      history.push(url);
    }
    clearData();
    fetchDataTransfers();
    fetchDatatypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfiguration]);

  useEffect(() => {
    clearData();
    fetchDataTransfers();
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
    let message = 'Select configuration';
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
    if (selectedConfiguration && data.data.length < 1) {
      message = 'No data';
    }

    return (
      <EmptyTableMessage
        text={message}
        isLoading={status === ProgressState.LOADING}
      />
    );
  }

  function filterByNameSearch(name: string) {
    let filtered = data.data;
    if (name.length > 0) {
      filtered = data.data.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }

  function resetFilters() {
    fetchProjects();
    clearData();
    setSelectedSourceProject(null);
    setSelectedTarget(null);
    setSelectedTargetProject(null);
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
            onNameSearchChange={filterByNameSearch}
            onReset={resetFilters}
          />
        )}
        {(selectedConfiguration || selectedSourceProject) && (
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
                  size="large"
                  style={{ width: 42, height: 42 }}
                  aria-label="Show/hide table columns"
                  icon="Settings"
                />
              </Dropdown>
            </Tooltip>
          </ColumnsSelector>
        )}
      </TableActions>
      <Table
        dataSource={filteredData}
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
          expandIcon: ({ expanded, onExpand, record }) => (
            <ExpandRowIcon
              type={expanded ? 'Down' : 'Right'}
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
