import React from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from 'antd';
import queryString from 'query-string';
import { useActiveWorkflow } from 'hooks';
import PnidParsingStatus from './PnidParsingStatus';
import FileActions from './FileActions';
import TagsDetected from './TagsDetected';

type ResultsTableProps = {
  rows: any;
  selectedKeys: any;
  setSelectedKeys: (keys: number[]) => void;
  setRenderFeedback: (shouldSet: boolean) => void;
};

export default function ResultsTable(props: ResultsTableProps): JSX.Element {
  const { rows, selectedKeys, setSelectedKeys, setRenderFeedback } = props;

  const { workflowId } = useActiveWorkflow();
  const history = useHistory();

  const { search } = history.location;
  const { page = 1 } = queryString.parse(search, { parseNumbers: true });

  const columns = [
    { dataIndex: 'name', title: 'Name', key: 'name' },
    {
      title: 'Status',
      key: 'status',
      ellipsis: true,
      render: (_: any, file: any) => (
        <PnidParsingStatus file={file} workflowId={workflowId} />
      ),
    },
    {
      title: 'Relationships',
      key: 'annotations_new',
      render: (_: any, file: any) => (
        <TagsDetected fileId={file.id} workflowId={workflowId} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (file: any) => (
        <FileActions file={file} setRenderFeedback={setRenderFeedback} />
      ),
    },
  ];

  const onSelectAll = (selectAll: boolean) =>
    setSelectedKeys(
      selectAll ? rows.map((el: any) => el.id) : ([] as number[])
    );
  const onRowChange = (keys: any) => setSelectedKeys(keys as number[]);
  const onPaginationChange = (newPage: number) => {
    history.push({
      search: queryString.stringify({
        ...queryString.parse(search),
        page: newPage,
      }),
    });
  };
  return (
    <Table
      rowSelection={{
        onSelectAll,
        onChange: onRowChange,
        selectedRowKeys: selectedKeys,
      }}
      columns={columns}
      dataSource={rows}
      rowKey="id"
      pagination={{
        onChange: onPaginationChange,
        current: Number(page),
      }}
    />
  );
}
