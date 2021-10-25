import React, { useState, useEffect } from 'react';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { FileInfo } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';
import { getContainer } from 'utils/utils';
import handleError from 'utils/handleError';
import { ExploreViewConfig } from '../../utils/types';
import ColumnWrapper from '../ColumnWrapper';

interface filesTableProps {
  dataSetId: number;
  setExploreView(value: ExploreViewConfig): void;
}

const FilesTable = ({ setExploreView, dataSetId }: filesTableProps) => {
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
          <Button
            type="link"
            onClick={() =>
              setExploreView({
                type: 'file',
                id: record.id,
                visible: true,
              })
            }
          >
            Preview
          </Button>
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
        pagination={{ pageSize: 5 }}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default FilesTable;
