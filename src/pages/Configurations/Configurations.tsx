import React, { useContext, useEffect, useState } from 'react';
import { Table } from 'antd';
import { ContentContainer } from 'elements';
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
import APIErrorContext from '../../contexts/APIErrorContext';

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
];

const Configurations = () => {
  const { api } = useContext(ApiContext);
  const { error, addError, removeError } = useContext(APIErrorContext);
  const [data, setData] = useState<GenericResponseObject[]>([]);
  const [columns, setColumns] = useState<
    ColumnsType<GenericResponseObject> | undefined
  >([]);

  function fetchConfigurations() {
    api!.configurations.get().then((response: GenericResponseObject[]) => {
      console.log(response);
      if (!response || response.length < 1 || response[0].error) {
        let errorObj = {
          message: 'No response',
          status: 400,
        };
        if (response[0].error) {
          errorObj = {
            message: response[0].statusText,
            status: response[0].status,
          };
        }
        addError(errorObj.message, errorObj.status);
      } else {
        removeError();
        setData(response);
      }
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

  const getNoDataText = () => {
    if (error) {
      return `API error: ${error.status} ${error.message}`;
    }
    return 'No data';
  };

  return (
    <>
      <CreateNewConfiguration />
      <ContentContainer>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          locale={{
            emptyText: getNoDataText(),
          }}
        />
      </ContentContainer>
    </>
  );
};

export default Configurations;
