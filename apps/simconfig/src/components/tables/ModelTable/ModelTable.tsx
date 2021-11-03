import { MouseEvent, useContext, useEffect } from 'react';
import moment from 'moment';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Button, Table, TableRow } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';
import { PAGES } from 'pages/Menubar';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchDownloadLinks } from 'store/file/thunks';
import {
  selectDownloadLinks,
  selectFileForDownload,
  selectProcessingDownload,
} from 'store/file/selectors';
import {
  setFileForDownload,
  setSelectedFile,
  setProcessingDownload,
} from 'store/file';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { forceDownloadDialog } from 'utils/fileDownload';

type ComponentProps = {
  data: FileInfoSerializable[];
  modelName?: string;
};

export default function ModelTable({ data, modelName }: ComponentProps) {
  const { path, url } = useRouteMatch();

  const history = useHistory();
  const dispatch = useAppDispatch();
  const links = useAppSelector(selectDownloadLinks);
  const processingDownload = useAppSelector(selectProcessingDownload);
  const fileForDownload = useAppSelector(selectFileForDownload);
  const { cdfClient } = useContext(CdfClientContext);

  useEffect(() => {
    downloadFile();
  }, [links]);

  const downloadFile = async () => {
    if (fileForDownload && links) {
      const { externalId } = fileForDownload;
      const fileName = fileForDownload.metadata?.fileName || '';
      const { downloadUrl } =
        links.find(
          (url) => 'externalId' in url && externalId === url.externalId
        ) || {};

      if (!downloadUrl) {
        throw new Error('No Matching download url');
      }
      const downloadHasError = await forceDownloadDialog(fileName, downloadUrl);
      if (downloadHasError) {
        /* TBD SIM-123 */
      }
      dispatch(setProcessingDownload(false));
      dispatch(setFileForDownload(undefined));
    }
  };

  const onDownloadClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const externalId = e.currentTarget.getAttribute('data-external-id') || null;
    if (externalId) {
      const file = data.find((record) => record.externalId === externalId);
      dispatch(setFileForDownload(file));
      dispatch(setProcessingDownload(true));
      dispatch(
        fetchDownloadLinks({
          client: cdfClient,
          externalIds: [{ externalId }],
        })
      );
    }
  };

  const getNewestFile = (items: FileInfoSerializable[]) =>
    items.sort(
      (a, b) => +(b.metadata?.version || '0') - +(a.metadata?.version || '0')
    )[0];

  const onCalculationsClicked = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const modelName = e.currentTarget.getAttribute('data-model') || null;
    if (modelName) {
      const files = data.filter((file) => file.name === modelName);
      if (modelName !== '' && files.length > 0) {
        const latestFile = getNewestFile(files);
        dispatch(setSelectedFile(latestFile));
        history.push(`/calculation-library/${modelName}`);
      }
    }
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
      accessor: (row: FileInfoSerializable) => row.metadata?.modelName,
    };
  };

  const isFileLoading = (externalId: string) =>
    processingDownload && fileForDownload?.externalId === externalId
      ? 'Loading'
      : 'Download';

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
            icon={isFileLoading(value)}
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
    const mapColumns = {
      [PAGES.MODEL_LIBRARY]: [
        'simulator',
        'name',
        'version',
        'updated',
        'download',
        'calculations',
      ],
      [PAGES.MODEL_LIBRARY_VERSION]: [
        'version',
        'userEmail',
        'description',
        'updated',
        'download',
      ],
    };
    const routeColumns = mapColumns[path];
    if (routeColumns === undefined) {
      return cols;
    }
    return cols
      .filter((column) => routeColumns.includes(column.id))
      .sort((a, b) => routeColumns.indexOf(a.id) - routeColumns.indexOf(b.id));
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
