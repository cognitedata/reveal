import React, { useContext, useEffect } from 'react';
import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ApiContext from 'contexts/ApiContext';
import { useQuery } from 'utils/functions';
import { DataTypesTableData } from 'pages/DataTransfers/types';

import {
  addColumnName,
  reportSuccess,
  removeColumnName,
  useDataTransfersDispatch,
  useDataTransfersState,
  reportLoading,
  updateFilters,
} from '../../../context/DataTransfersContext';
import { Filters } from '../../Filters';
import { TableActionsContainer, ColumnsSelector } from '../../../elements';
import config from '../../../datatransfer.config';
import { SelectColumnsMenu } from '../SelectColumnsMenu';

import {
  useFetchConfigurations,
  useFetchDataTransfers,
  useFetchDatatypes,
  useFetchProjects,
  useFetchSources,
} from './api';

interface Props {
  setFilteredData: React.Dispatch<React.SetStateAction<DataTypesTableData[]>>;
}

const TableActions: React.FC<Props> = ({ setFilteredData }) => {
  const { api } = useContext(ApiContext);
  const { url } = useRouteMatch();
  const history = useHistory();

  const query = useQuery();
  const configurationNameFromUrl = query.get('configuration');

  const dispatch = useDataTransfersDispatch();
  const {
    data,
    filters: {
      sourceProjects,
      sources,
      selectedConfiguration,
      selectedSource,
      selectedTarget,
      configurations,
      selectedSourceProject,
      targetProjects,
      selectedTargetProject,
      selectedDateRange,
      selectedDatatype,
      datatypes,
    },
  } = useDataTransfersState();

  const fetchDataTransfers = useFetchDataTransfers();
  const fetchDatatypes = useFetchDatatypes();
  const fetchProjects = useFetchProjects();
  const fetchConfigurations = useFetchConfigurations();
  const fetchSources = useFetchSources();

  function filterByNameSearch(name: string) {
    let filtered = data.data;
    if (name.length > 0) {
      filtered = data.data.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    setFilteredData(filtered);
  }

  function clearData() {
    dispatch(
      reportSuccess({
        data: [],
        columns: data.columns,
        rawColumns: data.rawColumns,
        allColumnNames: data.allColumnNames,
        selectedColumnNames: data.selectedColumnNames,
      })
    );
  }

  function resetFilters() {
    fetchProjects();
    clearData();
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

  // Might be useful to move this into a "common" hook
  useEffect(() => {
    dispatch(reportLoading());

    fetchConfigurations();
    fetchSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    clearData();
    dispatch(
      updateFilters({
        selectedTarget: null,
        selectedSourceProject: null,
        selectedTargetProject: null,
      })
    );
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource]);

  useEffect(() => {
    clearData();
    fetchDatatypes();
    dispatch(
      updateFilters({
        selectedTarget: null,
        selectedTargetProject: null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceProject]);

  useEffect(() => {
    clearData();
    fetchProjects();
    dispatch(
      updateFilters({
        selectedTargetProject: null,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTarget]);

  useEffect(() => {
    clearData();
    fetchProjects();
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
  }, [configurationNameFromUrl, configurations]);

  useEffect(() => {
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
