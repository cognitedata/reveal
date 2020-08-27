import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { ContentContainer } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import { ColumnsType } from 'antd/es/table';
import { generateColumnsFromData } from 'utils/functions';
import { GenericResponseObject } from 'typings/interfaces';

const defaultRules = {
  columns: [
    {
      name: 'business_tags',
      content: 'tags',
    },
  ],
};

function curateColumns(columns: any, rules: any) {
  return columns;
}

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const [data, setData] = useState<GenericResponseObject[]>([]);
  const [columns, setColumns] = useState<
    ColumnsType<GenericResponseObject> | undefined
  >([]);

  function fetchConfigurations() {
    api!.configurations.get().then((response) => {
      setData(response);
      return response;
    });
  }

  useEffect(() => {
    fetchConfigurations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const rawColumns = generateColumnsFromData(data);
    const curatedColumns = curateColumns(rawColumns, defaultRules);
    setColumns(curatedColumns);
  }, [data]);

  return (
    <>
      <CreateNewConfiguration />
      <ContentContainer>
        <Table dataSource={data} columns={columns} rowKey="id" />
      </ContentContainer>
    </>
  );
};

export default Configurations;
