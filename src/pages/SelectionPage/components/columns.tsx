import { dateSorter, stringCompare } from 'modules/contextualization/utils';

export const columns = [
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
    render: (name: string) => name ?? '-',
  },
  {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    sorter: (a: any, b: any) => stringCompare(a?.description, b?.description),
    render: (description: string) => description ?? '-',
  },
  {
    title: 'Relationships',
    key: 'relationships',
    dataIndex: 'relationships',
    sorter: (a: any, b: any) =>
      stringCompare(a?.relationships, b?.relationships),
    render: () => '-',
  },
  {
    title: 'Last modified',
    key: 'lastUpdatedTime',
    dataIndex: 'lastUpdatedTime',
    sorter: (item: any) => dateSorter(item?.lastUpdatedTime),
    render: (lastUpdatedTime: Date) =>
      lastUpdatedTime ? new Date(lastUpdatedTime).toLocaleDateString() : '-',
  },
];
