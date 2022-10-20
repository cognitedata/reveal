import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { FileInfo } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import {
  getContainer,
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import handleError from 'utils/handleError';
import ColumnWrapper from '../ColumnWrapper';
import { useTranslation } from 'common/i18n';
import { useQuery } from 'react-query';

interface filesTableProps {
  dataSetId: number;
  query: string;
}

const FilesTable = ({ dataSetId, query }: filesTableProps) => {
  const { t } = useTranslation();

  const { data: files } = useQuery(
    getResourceSearchQueryKey('files', query, dataSetId),
    () => sdk.files.search(getResourceSearchParams(dataSetId, query, 'name')),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-files-failed'), ...e });
      },
    }
  );

  const filesColumns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('source_one'),
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: t('action_other'),
      render: (record: FileInfo) => (
        <span>
          <Link to={createLink(`/explore/file/${record.id}`)}>{t('view')}</Link>
        </span>
      ),
    },
  ];

  return (
    <div id="#files">
      <ItemLabel>{t('files')}</ItemLabel>
      <Table
        rowKey="id"
        columns={filesColumns}
        dataSource={files}
        pagination={DEFAULT_ANTD_TABLE_PAGINATION}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default FilesTable;
