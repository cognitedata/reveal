import React, { useEffect } from 'react';
import { Button, Dropdown, Loader, Tooltip } from '@cognite/cogs.js';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from 'utils/functions';
import { useConfigurationsQuery } from 'services/endpoints/configurations/query';
import { useSourcesQuery } from 'services/endpoints/sources/query';
import config from 'configs/datatransfer.config';
import {
  addColumnName,
  reportSuccess,
  removeColumnName,
  useDataTransfersDispatch,
  useDataTransfersState,
  updateFilters,
  initialState,
} from 'contexts/DataTransfersContext';

import { DataTransfersTableData } from './types';
import { Filters } from './components/Filters';
import { TableActionsContainer, ColumnsSelector } from './elements';
import { SelectColumnsMenu } from './components/Table/SelectColumnsMenu';
import { usePrepareDataTransfersQuery } from './hooks/usePrepareDataTransfersQuery';
import { getSelectedColumnsPersistently } from './utils/Table/managePersistentColumns';
import { getColumnNames } from './utils/Table/columns';

const TableActions: React.FC = () => {
  const { url } = useRouteMatch();
  const history = useHistory();

  const query = useQuery();
  const configurationNameFromUrl = query.get('configuration');

  const dispatch = useDataTransfersDispatch();
  const {
    data,
    filters: { selectedConfiguration },
  } = useDataTransfersState();

  const { data: configurations, ...queryConfigurations } =
    useConfigurationsQuery();

  const { data: sources } = useSourcesQuery();

  const { data: datatransfers, ...queryDataTransfers } =
    usePrepareDataTransfersQuery();

  useEffect(() => {
    if (datatransfers.length > 0) {
      const handledData: DataTransfersTableData[] = datatransfers.map(
        (item) => ({
          id: item.source.id,
          source: item.source,
          target: item.target,
          status: item.status,
        })
      );

      dispatch(
        reportSuccess({
          data: handledData,
          allColumnNames: getColumnNames(
            handledData.length > 0 ? handledData : data.data
          ),
          selectedColumnNames: getSelectedColumnsPersistently(),
        })
      );
    } else {
      dispatch(
        reportSuccess({
          ...initialState.data,
          allColumnNames: getColumnNames(data.data),
          selectedColumnNames: getSelectedColumnsPersistently(),
        })
      );
    }
  }, [selectedConfiguration, queryDataTransfers.dataUpdatedAt]);

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
        allColumnNames: data.allColumnNames,
        selectedColumnNames: config.initialSelectedColumnNames,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        />
      )}
      {selectedConfiguration && (
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
