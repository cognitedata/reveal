import { MouseEvent } from 'react';
import moment from 'moment';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Button, Table, TableRow } from '@cognite/cogs.js';
import { forceDownloadDialog } from 'utils/fileDownload';
import { LinkWithID } from 'pages/ModelLibrary/types';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch } from 'store/hooks';
import { setSelectedFile } from 'store/file';

type ComponentProps = {
  data: FileInfoSerializable[];
  modelName?: string;
  links?: LinkWithID[];
};

export default function ModelTable({ data, modelName, links }: ComponentProps) {
  const { url } = useRouteMatch();

  const history = useHistory();
  const dispatch = useAppDispatch();

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
  const getNewestFile = (items: FileInfoSerializable[]) =>
    items.sort(
      (a, b) => +(b.metadata?.version || '0') - +(a.metadata?.version || '0')
    )[0];

  const onCalculationsClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const modelName = e.currentTarget.getAttribute('data-model') || '';

    const latestFile = getNewestFile(
      data.filter((file) => file.name === modelName)
    );

    dispatch(setSelectedFile(latestFile));

    history.push(`/calculation-library/${modelName}`);
  };

  const onRowClicked = async (row: TableRow<FileInfoSerializable>) => {
    if (!modelName) {
      await dispatch(setSelectedFile(undefined));
      history.push(`${url}/${row.original.name}`);
      return;
    }
    await dispatch(setSelectedFile(row.original));
  };

  const getNameColumnDefinition = () => {
    if (modelName) {
      return {
        id: 'description',
        Header: 'Description',
        accessor: (row: FileInfoSerializable) => row.metadata?.description,
      };
    }
    return {
      id: 'name',
      Header: 'Name',
      accessor: (row: FileInfoSerializable) => row.name,
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
      accessor: (row: FileInfoSerializable) => row.source,
      disableSortBy: true,
      width: 200,
    },
    {
      id: 'userEmail',
      Header: 'User',
      accessor: (row: FileInfoSerializable) => row.metadata?.userEmail,
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
      accessor: (row: FileInfoSerializable) => row.metadata?.version,
      sortType: 'number',
      sorter: true,
    },
    {
      id: 'updated',
      Header: 'Updated',
      accessor: (row: FileInfoSerializable) => row.lastUpdatedTime,
      sortType: 'number',
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
            aria-label="download"
            data-external-id={value}
            icon="Download"
            type="ghost"
            onClick={onDownloadClicked}
          />
        </>
      ),
      accessor: (row: FileInfoSerializable) => row.externalId,
      disableSortBy: true,
      width: 20,
    },
    {
      id: 'calculations',
      Header: '',
      Cell: ({ cell: { value } }: any) => (
        <>
          <Button
            aria-label="calculations"
            data-model={value}
            icon="FlowChart"
            type="ghost"
            onClick={onCalculationsClicked}
          />
        </>
      ),
      accessor: (row: FileInfoSerializable) => row.name,
      disableSortBy: true,
      maxWidth: 50,
      width: 20,
    },
  ];

  const getColumns = () => {
    /* Email should be listed only in model version details. */
    if (!modelName) {
      return cols.filter((col) => col.id !== 'userEmail');
    }
    return cols;
  };

  return (
    <Table<FileInfoSerializable>
      dataSource={data}
      filterable
      pagination
      columns={getColumns()}
      onRowClick={onRowClicked}
    />
  );
}
