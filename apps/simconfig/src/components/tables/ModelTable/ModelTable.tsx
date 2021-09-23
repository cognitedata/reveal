import moment from 'moment';
import { Table } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

type ComponentProps = {
  data: FileInfo[];
};

export default function ModelTable({ data }: ComponentProps) {
  return (
    <Table<FileInfo>
      dataSource={data}
      filterable
      columns={[
        {
          Header: 'Simulator',
          Cell: ({ cell: { value } }: any) => (
            <>
              <img
                src={`${
                  process.env.PUBLIC_URL
                }/simulators/${value.toLowerCase()}.png`}
                alt={value}
              />{' '}
              {value}
            </>
          ),
          accessor: 'source',
          disableSortBy: true,
          width: 200,
        },
        {
          Header: 'Name',
          Cell: ({ cell: { value } }: any) => <strong>{value}</strong>,
          Filter: Table.InputFilter(),
          filter: 'fuzzyText',
          filterIcon: 'Search',
          accessor: 'name',
        },
        {
          Header: 'Updated',
          accessor: 'lastUpdatedTime',
          sortType: 'datetime',
          Cell: ({ cell: { value } }: any) => (
            <>{moment(value).format('YYYY-MM-DD HH:mm')}</>
          ),
        },
      ]}
    />
  );
}
