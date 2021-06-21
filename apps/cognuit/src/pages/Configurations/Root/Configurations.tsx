import React, { useContext, useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import indexOf from 'lodash/indexOf';
import {
  AuthContext,
  AuthProvider as ContainerAuthProvider,
} from '@cognite/react-container';
import { Loader, Table } from '@cognite/cogs.js';
import { ContentContainer } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import {
  ExtendedConfigurationsResponse,
  GenericResponseObject,
} from 'typings/interfaces';
import { ConfigurationsResponse } from 'types/ApiInterface';
import { CustomError } from 'services/CustomError';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import APIErrorContext from 'contexts/APIErrorContext';

import { columnRules } from '../components/Table/columnRules';
import { renderExpandedRow } from '../components/Table/expandedRow';
import { generateConfigurationsColumnsFromData } from '../functions/generate';
import { curateColumns, curateConfigurationsData } from '../functions/curate';

import config from './configurations.config';

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const { authState } = React.useContext<AuthContext>(ContainerAuthProvider);
  const { token } = authState || {};

  const { error, addError, removeError } = useContext(APIErrorContext);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ExtendedConfigurationsResponse[]>([]);
  const [columns, setColumns] = useState<any>([]);

  const handleNameChange = (id: number, newName: string) => {
    const nameIndex = data.findIndex((item) => item.name === newName);
    if (nameIndex > -1) {
      addError(
        'Configuration name already exists, please choose other name',
        409
      );
      return false;
    }
    api!.configurations
      .update(id, { name: newName })
      .then(() => {
        removeError();
        return false;
      })
      .catch((err: CustomError) => {
        addError(err.message, err.status);
      });
    return true;
  };

  function setUpdatedConfiguration(
    id: number,
    response: GenericResponseObject
  ) {
    const dataClone = JSON.parse(JSON.stringify(data));
    const selIndex = data.findIndex((item) => item.id === id);
    if (selIndex > -1) {
      // eslint-disable-next-line prefer-destructuring
      dataClone[selIndex] = response;
      setData(curateConfigurationsData(dataClone));
    }
  }

  function fetchConfigurations() {
    setIsLoading(true);
    api!.configurations
      .get()
      .then((response: ConfigurationsResponse[]) => {
        setData(curateConfigurationsData(response));
        setIsLoading(false);
        removeError();
        return response;
      })
      .catch((err: CustomError) => {
        addError(err.message, err.status);
      });
  }

  function handleStopStart(id: number, isActive: boolean) {
    api!.configurations
      .startOrStopConfiguration(id, isActive)
      .then((response) => {
        setIsLoading(true);
        setUpdatedConfiguration(id, response);
        setIsLoading(false);
        removeError();
        return response;
      })
      .catch((err: CustomError) => {
        addError(err.message, err.status);
      });
  }

  useEffect(() => {
    if (token && token !== 'NO_TOKEN') {
      fetchConfigurations();
    }
  }, [token]);

  useEffect(() => {
    const rawColumns = generateConfigurationsColumnsFromData(data);
    const curatedColumns = curateColumns(
      rawColumns,
      columnRules({ handleNameChange, handleStopStart })
    );
    setColumns(curatedColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const [expanded, setExpanded] = React.useState<any>({});

  const onRowHandleClick = (rowElement: any) => {
    const { id } = rowElement.original as any;
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  if (error) {
    return (
      <ErrorMessage
        message={`Failed to fetch configurations. API error: ${error.status} ${error.message}`}
      />
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <CreateNewConfiguration />
      <ContentContainer>
        <Table<ExtendedConfigurationsResponse>
          dataSource={data}
          expandedIds={expanded}
          columns={sortBy(columns, (obj) =>
            indexOf(config.visibleColumns, obj.accessor)
          )}
          renderSubRowComponent={renderExpandedRow}
          onRowClick={onRowHandleClick}
        />
      </ContentContainer>
    </>
  );
};

export default Configurations;
