import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { Route, useRouteMatch } from 'react-router-dom';
import { ContentContainer } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import { ColumnsType } from 'antd/es/table';
import New from './New/index';
import { generateColumnsFromResponse } from '../../utils/functions';
import { GenericResponseObject } from '../../typings/interfaces';

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const [data, setData] = useState<GenericResponseObject[]>([]);
  const [columns, setColumns] = useState<
    ColumnsType<GenericResponseObject> | undefined
  >([]);
  const { url } = useRouteMatch();

  function fetchConfigurations() {
    api!.configurations
      .get()
      .then((response) => {
        setData(response);
        return response;
      })
      .then((response) => {
        setColumns(generateColumnsFromResponse(response));
      });
  }

  useEffect(() => {
    fetchConfigurations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Route exact path="/configurations">
        <CreateNewConfiguration />
        <ContentContainer>
          <Table dataSource={data} columns={columns} rowKey="id" />
        </ContentContainer>
      </Route>
      <Route exact path={`${url}/new/:type`}>
        <New />
      </Route>
    </>
  );
};

export default Configurations;
