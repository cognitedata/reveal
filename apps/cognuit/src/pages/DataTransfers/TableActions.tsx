import React, { useEffect } from 'react';
import { Button, Dropdown, Loader, Tooltip } from '@cognite/cogs.js';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from 'utils/functions';
import { DataTypesTableData } from 'pages/DataTransfers/types';
import { useConfigurationsQuery } from 'services/endpoints/configurations/query';
import { useDatatypesQuery } from 'services/endpoints/datatypes/query';
import { useSourcesQuery } from 'services/endpoints/sources/query';
import { useProjectsQuery } from 'services/endpoints/projects/query';
import config from 'configs/datatransfer.config';
import {
  addColumnName,
  reportSuccess,
  removeColumnName,
  useDataTransfersDispatch,
  useDataTransfersState,
  updateFilters,
  reportClear,
  initialState,
} from 'contexts/DataTransfersContext';

import { Filters } from './components/Filters';
import { TableActionsContainer, ColumnsSelector } from './elements';
import { SelectColumnsMenu } from './components/Table/SelectColumnsMenu';
import {
  getColumnNames,
  usePrepareDataTransfersQuery,
} from './hooks/usePrepareDataTransfersQuery';
import { selectColumns } from './utils';

interface Props {
  setFilteredData: React.Dispatch<React.SetStateAction<DataTypesTableData[]>>;
}

const TableActions: React.FC<Props> = ({ setFilteredData }) => {
  const { url } = useRouteMatch();
  const history = useHistory();

  const query = useQuery();
  const configurationNameFromUrl = query.get('configuration');

  const dispatch = useDataTransfersDispatch();
  const {
    data,
    filters: {
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      selectedSourceProject,
      selectedTargetProject,
      selectedDateRange,
      selectedDatatype,
    },
  } = useDataTransfersState();

  const { data: configurations, ...queryConfigurations } =
    useConfigurationsQuery();

  const { data: datatypes } = useDatatypesQuery({
    id: selectedSourceProject?.id || null,
    enabled: !!(selectedSourceProject && selectedSourceProject.id),
  });

  const { data: sources } = useSourcesQuery();

  const { data: sourceProjects } = useProjectsQuery({
    source: selectedSource,
    enabled: !!selectedSource,
  });

  const { data: targetProjects } = useProjectsQuery({
    source: selectedTarget,
    enabled: !!selectedTarget,
  });

  const { data: datatransfers, ...queryDataTransfers } =
    usePrepareDataTransfersQuery();

  useEffect(() => {
    if (datatransfers.length > 0) {
      const handledData: DataTypesTableData[] = datatransfers.map((item) => ({
        ...item.source,
        status: item.status,
        report: item.status,
      }));

      dispatch(
        reportSuccess({
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
        })
      );
    } else {
      dispatch(
        reportSuccess({
          ...initialState.data,
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
        })
      );
    }
  }, [
    selectedConfiguration,
    selectedDatatype,
    queryDataTransfers.dataUpdatedAt,
  ]);

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
    dispatch(reportClear());
    dispatch(
      updateFilters({
        selectedTarget: null,
        selectedSourceProject: null,
        selectedTargetProject: null,
      })
    );
  }

  function handleColumnSelection(name: string, nextState: boolean) {
    if (name === undefined) return;
    if (nextState) {
      dispatch(addColumnName(name));
    } else {
      dispatch(removeColumnName(name));
    }
  }

  useEffect(() => {
    dispatch(
      reportSuccess({
        data: [],
        columns: data.columns,
        rawColumns: data.rawColumns,
        allColumnNames: data.allColumnNames,
        selectedColumnNames: config.initialSelectedColumnNames,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(reportClear());
    dispatch(
      updateFilters({
        selectedTarget: null,
        selectedSourceProject: null,
        selectedTargetProject: null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource]);

  useEffect(() => {
    dispatch(reportClear());
    dispatch(
      updateFilters({
        selectedTarget: null,
        selectedTargetProject: null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceProject]);

  useEffect(() => {
    dispatch(reportClear());
    dispatch(
      updateFilters({
        selectedTargetProject: null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  useEffect(() => {
    dispatch(reportClear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget, selectedTargetProject, selectedDateRange]);

  useEffect(() => {
    if (configurationNameFromUrl) {
      const selectedConfig = configurations.find(
        (item) => item.name === configurationNameFromUrl
      );
      if (selectedConfig) {
        dispatch(updateFilters({ selectedConfiguration: selectedConfig }));
      } else {
        dispatch(updateFilters({ selectedConfiguration: null }));
      }
    } else {
      dispatch(updateFilters({ selectedConfiguration: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configurationNameFromUrl, queryConfigurations.isFetched]);

  if (queryDataTransfers.isLoading) {
    return <Loader />;
  }

  return (
    <TableActionsContainer>
      {sources.length > 0 && (
        <Filters
          source={{
            sources,
            selected: selectedSource,
            onSelectSource: (nextSelected) =>
              dispatch(updateFilters({ selectedSource: nextSelected })),
            projects: sourceProjects,
            selectedProject: selectedSourceProject,
            onSelectProject: (nextSelected) =>
              dispatch(updateFilters({ selectedSourceProject: nextSelected })),
          }}
          target={{
            targets: sources,
            selected: selectedTarget,
            onSelectTarget: (nextSelected) =>
              dispatch(updateFilters({ selectedTarget: nextSelected })),
            projects: targetProjects,
            selectedProject: selectedTargetProject,
            onSelectProject: (nextSelected) =>
              dispatch(updateFilters({ selectedTargetProject: nextSelected })),
          }}
          configuration={{
            configurations,
            selected: selectedConfiguration,
            onSelectConfiguration: (nextSelected) => {
              history.push(
                nextSelected
                  ? `${url}?configuration=${nextSelected?.name}`
                  : url
              );
            },
          }}
          datatype={{
            types: datatypes,
            selected: selectedDatatype,
            onSelectType: (nextSelected) =>
              dispatch(updateFilters({ selectedDatatype: nextSelected })),
          }}
          date={{
            selectedRange: selectedDateRange,
            onSelectDate: (nextSelected) =>
              dispatch(updateFilters({ selectedDateRange: nextSelected })),
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
                  onChange={handleColumnSelection}
                />
              }
            >
              <Button
                size="default"
                style={{ width: 42, height: 42 }}
                aria-label="Show/hide table columns"
                icon="Settings"
              />
            </Dropdown>
          </Tooltip>
        </ColumnsSelector>
      )}
    </TableActionsContainer>
  );
};

export default TableActions;
