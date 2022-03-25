import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import { getContainer } from 'utils/shared';
import {
  EmptyLineageDot,
  LineageDot,
  LineageSubTitle,
  LineageTitle,
} from '../../utils/styledComponents';
import { ConsumerTableColumns } from './ConsumerTableColumns';
import { Consumer, DataSet } from '../../utils/types';

interface ConsumerTableProps {
  dataSet?: DataSet;
}

export const CONSUMER_HEADING: Readonly<string> = 'Data consumers';
const ConsumerTable: FunctionComponent<ConsumerTableProps> = ({
  dataSet,
}: PropsWithChildren<ConsumerTableProps>) => {
  const [consumerList, setConsumerList] = useState<Consumer[]>([]);
  const setConsumers = (consumers: Consumer[] = []) => {
    setConsumerList(consumers);
  };
  useEffect(() => {
    if (dataSet?.metadata?.consumers?.length) {
      setConsumers(dataSet.metadata.consumers);
    }
  }, [dataSet]);

  return (
    <Timeline.Item
      dot={
        consumerList && consumerList.length ? (
          <LineageDot />
        ) : (
          <EmptyLineageDot />
        )
      }
    >
      <LineageTitle>{CONSUMER_HEADING}</LineageTitle>
      <LineageSubTitle>
        The below information shows what system or project are data consumers
        using the data. For now this information needs to be manually
        registered.
      </LineageSubTitle>
      <Table
        columns={ConsumerTableColumns}
        dataSource={consumerList}
        pagination={{ pageSize: 5 }}
        rowKey={(record: Consumer) =>
          `${record?.name}/${record?.contact?.email}`
        }
        getPopupContainer={getContainer}
      />
    </Timeline.Item>
  );
};

export default ConsumerTable;
