import React, { useContext, useEffect, useState } from 'react';
import { Loader, Table, TableProps } from '@cognite/cogs.js';
import { ContentContainer } from 'elements';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import { ExtendedConfigurationsResponse } from 'typings/interfaces';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import APIErrorContext from 'contexts/APIErrorContext';
import { useConfigurationsQuery } from 'services/endpoints/configurations/query';
import { useConfigurationsMutation } from 'services/endpoints/configurations/mutation';
import { ConfigurationsResponse } from 'types/ApiInterface';
import config from 'configs/configurations.config';
import { sortColumnsByRules } from 'utils/sorts';
import { curateTableColumns } from 'utils/Table/curate';

import { columnRules } from './components/Table/columnRules';
import { ExpandedSubRow } from './components/Table/ExpandedSubRow';
import { generateConfigurationsColumnsFromData } from './utils/generate';
import { curateConfigurationsData } from './utils/curate';

const Configurations = () => {
  const { error, addError } = useContext(APIErrorContext);
  const [data, setData] = useState<ExtendedConfigurationsResponse[]>([]);
  const [columns, setColumns] = useState<
    TableProps<ConfigurationsResponse>['columns']
  >([]);
  const [expandedColumns, setExpandedColumns] = React.useState<any>({});

  const { isLoading, ...configsQuery } = useConfigurationsQuery();
  const {
    updateConfigurations,
    startOrStopConfigurations,
    restartConfigurations,
  } = useConfigurationsMutation();

  const handleNameChange = (id: number, newName: string) => {
    const nameIndex = data.findIndex((item) => item.name === newName);
    if (nameIndex > -1) {
      addError(
        'Configuration name already exists, please choose other name',
        409
      );
      return false;
    }

    updateConfigurations.mutateAsync({ id, name: newName }).then(() => {
      return false;
    });

    return true;
  };

  function setUpdatedConfiguration(
    id: number,
    response: ConfigurationsResponse
  ) {
    const dataClone = JSON.parse(JSON.stringify(data));
    const selIndex = data.findIndex((item) => item.id === id);
    if (selIndex > -1) {
      // eslint-disable-next-line prefer-destructuring
      dataClone[selIndex] = response;
      setData(curateConfigurationsData(dataClone));
    }
  }

  function handleStopStart(id: number, isActive: boolean) {
    startOrStopConfigurations
      .mutateAsync({ id, isActive })
      .then((response: ConfigurationsResponse) => {
        setUpdatedConfiguration(id, response);
      });
  }

  function handleRestart(id: number) {
    restartConfigurations.mutate({ id });
  }

  // Cogs.js hasn't exported Row from React Table.
  const handleRowClick = (rowElement: any) => {
    const { id } = rowElement.original as any;
    setExpandedColumns((prevState: any) => ({
      ...prevState,
      [id]: !expandedColumns[id],
    }));
  };

  const tableColumns = React.useMemo(() => {
    return sortColumnsByRules(columns, config.visibleColumns);
  }, [columns]);

  useEffect(() => {
    if (configsQuery.isSuccess) {
      setData(curateConfigurationsData(configsQuery.data));
    }
  }, [configsQuery.data, configsQuery.isSuccess]);

  useEffect(() => {
    const rawColumns = generateConfigurationsColumnsFromData(data);
    const curatedColumns = curateTableColumns(
      rawColumns,
      columnRules({ handleNameChange, handleStopStart, handleRestart })
    );
    setColumns(curatedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) {
    return <Loader infoTitle="Loading configurations" darkMode={false} />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch configurations. API error: ${error.status} ${error.message}`}
      />
    );
  }

  return (
    <>
      <CreateNewConfiguration />
      <ContentContainer>
        <Table<ExtendedConfigurationsResponse>
          dataSource={data}
          expandedIds={expandedColumns}
          rowKey={(data, index) => `configuration-${data.id}-${index}`}
          columns={tableColumns}
          renderSubRowComponent={ExpandedSubRow}
          onRowClick={handleRowClick}
        />
      </ContentContainer>
    </>
  );
};

export default Configurations;
