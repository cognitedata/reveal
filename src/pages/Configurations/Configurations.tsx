import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { ContentContainer, StatusIcon } from 'elements';
import ApiContext from 'contexts/ApiContext';
import CreateNewConfiguration from 'components/Molecules/CreateNewConfiguration';
import { ColumnsType } from 'antd/es/table';
import { curateColumns, generateColumnsFromData } from 'utils/functions';
import {
  GenericResponseObject,
  Rule,
  UNIX_TIMESTAMP_FACTOR,
} from 'typings/interfaces';
import { Badge } from '@cognite/cogs.js';

// noinspection HtmlUnknownTarget
const rules: Rule[] = [
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
  {
    key: 'created_time',
    render: (record: number) =>
      new Date(record * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
  },
  {
    key: 'last_updated',
    render: (record: number) =>
      new Date(record * UNIX_TIMESTAMP_FACTOR).toLocaleString(),
  },
  {
    key: 'source',
    render: (record: any) => record.external_id,
  },
  {
    key: 'target',
    render: (record: any) => record.external_id,
  },
  {
    key: 'status_active',
    render: (record: boolean) => {
      const color = record ? 'green' : 'lightgrey';
      return (
        <StatusIcon
          type="Info"
          style={{ color }}
          title={record ? 'Active' : 'Inactive'}
        />
      );
    },
  },
];

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
    const curatedColumns = curateColumns(rawColumns, rules);
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
