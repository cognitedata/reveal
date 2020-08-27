import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { ContentContainer } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { generateColumnsFromData } from 'utils/functions';
import { GenericResponseObject } from 'typings/interfaces';
import { Badge } from '@cognite/cogs.js';

interface Rule {
  key: string;
  render: (record: any) => React.ReactFragment;
}

const defaultRules: Rule[] = [
  {
    key: 'business_tags',
    render: (record: string[]) =>
      record.map((tag: string) => (
        <Badge key={tag} text={tag} background="greyscale-grey2" />
      )),
  },
  {
    key: 'datatypes',
    render: (record: string[]) =>
      record.map((tag: string) => (
        <Badge key={tag} text={tag} background="greyscale-grey2" />
      )),
  },
];

function curateColumns(columns: any, rules: any) {
  const tmp = columns;
  if (columns) {
    rules.map((rule: Rule) => {
      const index = columns.findIndex(
        (column: ColumnType<any>) => column.key === rule.key
      );
      tmp[index].render = rule.render;
      return null;
    });
  }
  return tmp;
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
