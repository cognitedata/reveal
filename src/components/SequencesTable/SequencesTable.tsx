import React, { useState, useEffect } from 'react';
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

interface sequencesTableProps {
  dataSetId: number;
}

const SequencesTable = ({ dataSetId }: sequencesTableProps) => {
  const [sequences, setSequences] = useState<Sequence[]>();

  const sequencesColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (value: any) => <ColumnWrapper title={value} />,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      render: (record: Sequence) => (
        <span>
          <Link to={createLink(`/explore/sequence/${record.id}`)}>View</Link>
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
        handleError({ message: 'Failed to fetch sequences', ...e });
      });
  }, [dataSetId]);

  return (
    <div id="#sequences">
      <ItemLabel>Sequences</ItemLabel>
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
