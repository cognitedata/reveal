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
};

export default function ModelTable({ data, modelName, links }: ComponentProps) {
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

  const onRowClicked = (row: TableRow) => {
    if (!modelName) {
      history.push(`${url}/${row.original.name}`);
    }
  };

  const getNameColumnDefinition = () => {
    if (modelName) {
      return {
        Header: 'Description',
        accessor: 'description',
      };
    }
    return {
      Header: 'Name',
      accessor: 'name',
    };
  };

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
          ...getNameColumnDefinition(),
          Cell: ({ cell: { value } }: any) => <strong>{value}</strong>,
          Filter: Table.InputFilter(),
          filter: 'fuzzyText',
          filterIcon: 'Search',
        },
        {
          Header: 'Version',
          accessor: 'metadata.version',
          sortType: 'number',
          sorter: true,
        },
        {
          Header: 'Updated',
          accessor: 'lastUpdatedTime',
          sortType: 'datetime',
          Cell: ({ cell: { value } }: any) => (
            <>{moment(value).format('YYYY-MM-DD HH:mm')}</>
          ),
        },
        {
          Cell: ({ cell: { value } }: any) => (
            <>
              <Button
                data-external-id={value}
                icon="Download"
                onClick={onDownloadClicked}
              />
            </>
          ),
          accessor: 'externalId',
          disableSortBy: true,
          width: 200,
        },
      ]}
      onRowClick={onRowClicked}
    />
  );
}
