import { MouseEvent } from 'react';
import moment from 'moment';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Button, Table, TableRow } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { forceDownloadDialog } from 'utils/fileDownload';
import { LinkWithID } from 'pages/ModelLibrary/types';

type ComponentProps = {
  data: FileInfo[];
  modelName?: string;
  links?: LinkWithID[];
  setSelectedRow: (row: any) => void;
};

export default function ModelTable({
  data,
  modelName,
  links,
  setSelectedRow,
}: ComponentProps) {
  const { url } = useRouteMatch();
  const history = useHistory();

  const onDownloadClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.currentTarget.getAttribute('data-external-id') || '';
    if (!links) {
      return;
    }

    const { downloadUrl } =
      links.find((url) => 'externalId' in url && value === url.externalId) ||
      {};

    if (!downloadUrl) {
      throw new Error('No Matching download url');
    }
    forceDownloadDialog(value, downloadUrl);
  };

  const onRowClicked = (row: TableRow<FileInfo>) => {
    if (!modelName) {
      setSelectedRow(undefined);
      history.push(`${url}/${row.original.name}`);
      return;
    }
    setSelectedRow(row.original);
  };

  const getNameColumnDefinition = () => {
    if (modelName) {
      return {
        id: 'description',
        Header: 'Description',
        accessor: (row: FileInfo) => row.metadata?.description,
      };
    }
    return {
      id: 'name',
      Header: 'Name',
      accessor: (row: FileInfo) => row.name,
    };
  };
  const cols = [
    {
      id: 'simulator',
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
      accessor: (row: FileInfo) => row.source,
      disableSortBy: true,
      width: 200,
    },
    {
      ...getNameColumnDefinition(),
      Cell: ({ cell: { value } }: any) => <strong>{value}</strong>,
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
    },
    {
      id: 'version',
      Header: 'Version',
      accessor: (row: FileInfo) => row.metadata?.version,
      sortType: 'number',
      sorter: true,
    },
    {
      id: 'updated',
      Header: 'Updated',
      accessor: (row: FileInfo) => row.lastUpdatedTime,
      sortType: 'datetime',
      Cell: ({ cell: { value } }: any) => (
        <>{moment(value).format('YYYY-MM-DD HH:mm')}</>
      ),
    },
    {
      id: 'download',
      Header: '',
      Cell: ({ cell: { value } }: any) => (
        <>
          <Button
            data-external-id={value}
            icon="Download"
            onClick={onDownloadClicked}
          />
        </>
      ),
      accessor: (row: FileInfo) => row.externalId,
      disableSortBy: true,
      width: 200,
    },
  ];

  return (
    <Table<FileInfo>
      dataSource={data}
      filterable
      pagination
      columns={cols}
      onRowClick={onRowClicked}
    />
  );
}
