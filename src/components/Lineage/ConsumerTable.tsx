import {
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
import { useTranslation } from 'common/i18n';

interface ConsumerTableProps {
  dataSet?: DataSet;
}

const ConsumerTable: FunctionComponent<ConsumerTableProps> = ({
  dataSet,
}: PropsWithChildren<ConsumerTableProps>) => {
  const { t } = useTranslation();
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
      <LineageTitle>{t('data-consumer_other')}</LineageTitle>
      <LineageSubTitle>{t('lineage-data-consumers-subtitle')}</LineageSubTitle>
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
