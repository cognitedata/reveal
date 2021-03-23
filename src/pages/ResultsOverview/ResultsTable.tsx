import React from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from 'antd';
import { FileInfo } from '@cognite/sdk';
import queryString from 'query-string';
import PnidParsingStatus from './PnidParsingStatus';
import TagsDetectedNew from './TagsDetectedNew';
import TagsDetectedTotal from './TagsDetectedTotal';
import FileActions from './FileActions';

type ResultsTableProps = {
  rows: any;
  selectedKeys: any;
  setSelectedKeys: (keys: number[]) => void;
  setRenderFeedback: (shouldSet: boolean) => void;
};

export default function ResultsTable(props: ResultsTableProps): JSX.Element {
  const { rows, selectedKeys, setSelectedKeys, setRenderFeedback } = props;
  const history = useHistory();
  const { search } = history.location;
  const { page } = queryString.parse(search, { parseNumbers: true });

  const columns = [
    { dataIndex: 'name', title: 'Name', key: 'name' },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, file: any) => <PnidParsingStatus file={file} />,
    },
    {
      title: 'New detected tags',
      key: 'annotations_new',
      render: (_: any, file: any) => <TagsDetectedNew file={file} />,
    },
    {
      title: 'Total detected tags',
      key: 'annotations',
      render: (file: FileInfo) => <TagsDetectedTotal file={file} />,
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
        current: (page || 0) as number,
      }}
    />
  );
}
