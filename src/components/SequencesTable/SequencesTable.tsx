import React, { useState, useEffect } from 'react';
import { ItemLabel } from 'utils/styledComponents';
import Table from 'antd/lib/table';
import { Sequence } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';
import { handleError } from 'utils/handleError';
import { getContainer } from 'utils/utils';
import { ExploreViewConfig } from '../../utils/types';
import ColumnWrapper from '../ColumnWrapper';

interface sequencesTableProps {
  dataSetId: number;
  setExploreView(value: ExploreViewConfig): void;
}

const SequencesTable = ({ setExploreView, dataSetId }: sequencesTableProps) => {
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
          <Button
            type="link"
            onClick={() =>
              setExploreView({
                type: 'sequence',
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
        pagination={{ pageSize: 5 }}
        getPopupContainer={getContainer}
      />
    </div>
  );
};

export default SequencesTable;
