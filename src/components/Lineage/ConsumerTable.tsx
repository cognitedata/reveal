import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {
  LineageSubTitle,
  LineageTitle,
  LineageSection,
} from '../../utils/styledComponents';
import { useConsumerTableColumns } from './ConsumerTableColumns';
import { Consumer, DataSet } from '../../utils/types';
import { useTranslation } from 'common/i18n';
import { Table } from '@cognite/cogs.js';

interface ConsumerTableProps {
  dataSet?: DataSet;
}

const ConsumerTable: FunctionComponent<ConsumerTableProps> = ({
  dataSet,
}: PropsWithChildren<ConsumerTableProps>) => {
  const { t } = useTranslation();
  const { ConsumerTableColumns } = useConsumerTableColumns();
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
    <LineageSection>
      <LineageTitle>
        {t('data-consumer_other', { postProcess: 'uppercase' })}
      </LineageTitle>
      <LineageSubTitle>{t('lineage-data-consumers-subtitle')}</LineageSubTitle>
      <Table
        columns={ConsumerTableColumns}
        dataSource={consumerList}
        pageSize={5}
        rowKey={(record: Consumer) =>
          `${record?.name}/${record?.contact?.email}`
        }
      />
    </LineageSection>
  );
};

export default ConsumerTable;
