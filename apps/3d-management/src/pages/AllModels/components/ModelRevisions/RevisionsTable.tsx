import React, { useState } from 'react';

import Table, { ColumnProps } from 'antd/lib/table';
import { Button } from '@cognite/cogs.js';
import Popover from 'antd/lib/popover';
import dayjs from 'dayjs';

import EmptyState from 'src/pages/AllModels/components/EmptyState/index';
import { getContainer } from 'src/utils';
import { TableOperations } from 'src/pages/AllModels/components/TableOperations';
import Status from 'src/components/Status/index';
import Thumbnail from 'src/components/Thumbnail';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { ThumbnailPreviewIcon } from 'src/components/ThumbnailPreviewIcon';

type Props = {
  revisions: Array<v3.Revision3D>;
  onRowClick: (revisionId: number) => void;
  refresh: () => void;
};

type State = {
  sortedInfo: Partial<any>;
  filteredInfo: Partial<any>;
};

export function RevisionsTable(props: Props) {
  const [state, setState] = useState<State>({
    sortedInfo: {},
    filteredInfo: {},
  });
  const { sortedInfo, filteredInfo } = state;
  const columns: ColumnProps<v3.Revision3D>[] = [
    {
      title: '',
      width: '50px',
      key: 'thumbnail',
      align: 'center',
      className: 'lh-0',
      render: (val) =>
        val.thumbnailThreedFileId && (
          <Popover
            title={dayjs(val.createdTime).format('MMM D, YYYY h:mm A')}
            trigger="click"
            content={
              <Thumbnail fileId={val.thumbnailThreedFileId} width="400px" />
            }
          >
            <ThumbnailPreviewIcon onClick={(e) => e.stopPropagation()} />
          </Popover>
        ),
    },
    {
      title: 'Date Created',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (val) => dayjs(val).format('MMM D, YYYY h:mm A'),
      sortOrder: sortedInfo.columnKey === 'createdTime' && sortedInfo.order,
      sorter: (a, b) => a.createdTime.getTime() - b.createdTime.getTime(),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      filters: [
        { text: 'Done', value: 'Done' },
        { text: 'Processing', value: 'Processing' },
        { text: 'Failed', value: 'Failed' },
        { text: 'Queued', value: 'Queued' },
      ],
      onFilter: (filter, item) => filter === item.status,
      filteredValue: filteredInfo.status || null,
      render: (item) => <Status status={item || 'error'} />,
    },
    {
      title: 'Published',
      dataIndex: 'published',
      key: 'published',
      filters: [
        { text: 'Published', value: 'true' },
        { text: 'Unpublished', value: 'false' },
      ],
      filteredValue: filteredInfo.published || null,
      onFilter: (filter, item) => filter === item.published.toString(),
      render: (published: boolean) => (published ? 'Published' : 'Unpublished'),
    },
  ];

  const handleChange = (pagination, filters, sorter) => {
    setState({
      sortedInfo: sorter,
      filteredInfo: filters,
    });
  };

  const clearAll = () => {
    setState({
      sortedInfo: {},
      filteredInfo: {},
    });
  };

  return (
    <Table
      loading={!props.revisions}
      columns={columns}
      dataSource={props.revisions}
      pagination={false}
      rowKey={(item) => item.id}
      onChange={handleChange}
      onRow={(record: v3.Revision3D) => ({
        onClick: () => {
          props.onRowClick(record.id);
        },
      })}
      locale={{
        emptyText: (
          <EmptyState type="ThreeDModel" text="No revisions available" />
        ),
      }}
      getPopupContainer={getContainer}
      footer={() => (
        <TableOperations>
          <Button onClick={clearAll}>Clear Sorting and Filters</Button>
          {props.refresh ? (
            <Button onClick={props.refresh}>Refresh</Button>
          ) : null}
        </TableOperations>
      )}
    />
  );
}
