import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { FileInfo } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { getContainer } from 'utils/shared';
import { DEFAULT_ANTD_TABLE_PAGINATION } from 'utils/tableUtils';
import handleError from 'utils/handleError';
import ColumnWrapper from '../ColumnWrapper';

interface filesTableProps {
  dataSetId: number;
}

const FilesTable = ({ dataSetId }: filesTableProps) => {
  const [files, setFiles] = useState<FileInfo[]>();

  useEffect(() => {
    sdk.files
      .list({ filter: { dataSetIds: [{ id: dataSetId }] } })
      .then((res) => {
        setFiles(res.items);
      })
      .catch((e) => {
        handleError({ message: 'Failed to fetch files', ...e });
      });
  }, [dataSetId]);

  const filesColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Actions',
      render: (record: FileInfo) => (
        <span>
          <Link to={createLink(`/explore/file/${record.id}`)}>View</Link>
        </span>
      ),
    },
  ];

  return (
    <div id="#files">
      <ItemLabel>Files</ItemLabel>
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
