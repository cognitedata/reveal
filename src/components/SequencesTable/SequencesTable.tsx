import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Sequence } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { handleError } from 'utils/handleError';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';

interface sequencesTableProps {
  dataSetId: number;
}

const SequencesTable = ({ dataSetId }: sequencesTableProps) => {
  const { t } = useTranslation();
  const [sequences, setSequences] = useState<Sequence[]>();

  const sequencesColumns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('action_other'),
      render: (record: Sequence) => (
        <span>
          <Link to={createLink(`/explore/sequence/${record.id}`)}>
            {t('view')}
          </Link>
        </span>
      ),
    },
  ];
  useEffect(() => {
    sdk.sequences
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => {
        setSequences(res.items);
      })
      .catch((e) => {
        handleError({ message: t('fetch-sequences-failed'), ...e });
      });
  }, [dataSetId, t]);

  return (
    <div id="#sequences">
      <ItemLabel>{t('sequence_other')}</ItemLabel>
      <Table
        rowKey="id"
        columns={sequencesColumns}
        dataSource={sequences}
        pagination={DEFAULT_ANTD_TABLE_PAGINATION}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default SequencesTable;
