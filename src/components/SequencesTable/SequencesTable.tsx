import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Sequence } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { handleError } from 'utils/handleError';
import {
  getContainer,
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';
import { useQuery } from 'react-query';

interface sequencesTableProps {
  dataSetId: number;
  query: string;
}

const SequencesTable = ({ dataSetId, query }: sequencesTableProps) => {
  const { t } = useTranslation();

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

  const { data: sequences } = useQuery(
    getResourceSearchQueryKey('sequences', query, dataSetId),
    () => sdk.sequences.search(getResourceSearchParams(dataSetId, query)),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-sequences-failed'), ...e });
      },
    }
  );
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
