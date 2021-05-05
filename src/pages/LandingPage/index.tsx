import { Button, Graphic, Title, Tooltip } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { message, Modal, notification } from 'antd';
import { FileInfo } from 'cognite-sdk-v3';
import { Flex, IconButton, Loader, PageTitle, Table } from 'components/Common';
import DetectedTags from 'components/DetectedTags';
import { sleep } from 'utils/utils';
import { useAnnotatedFiles } from 'hooks';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { createNewWorkflow } from 'modules/workflows';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { diagramSelection } from 'routes/paths';
import {
  PERMISSIONS_STRINGS,
  TOOLTIP_STRINGS,
  WARNINGS_STRINGS,
} from 'stringConstants';
import styled from 'styled-components';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import FilterBar from './FilterBar';

const PAGE_SIZE = 10;

const Wrapper = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const getColumns = (
  onFileEdit: (event: any) => any,
  onFileView: (event: any) => any,
  onClearAnnotations: (file: FileInfo) => void,
  writeAccess: boolean
) => [
  {
    title: 'Preview',
    key: 'preview',
    width: 80,
    align: 'center' as 'center',
    render: () => (
      <Flex row align justify>
        <Tooltip content="File previews are temporarily unavailable.">
          <Graphic type="Image" />
        </Tooltip>
      </Flex>
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <div>{name}</div>,
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
  },
  {
    title: 'Detected tags',
    key: 'tags',
    render: (row: FileInfo) => <DetectedTags fileId={row.id} />,
  },
  {
    title: 'Last modified',
    dataIndex: 'lastUpdatedTime',
    key: 'lastUpdatedTime',
    render: (date: string) => {
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
    sorter: dateSorter((x: any) => x?.lastUpdatedTime!),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Settings',
    dataIndex: '',
    key: 'settings',
    width: '100px',
    align: 'center' as 'center',
    render: (row: FileInfo) => (
      <Flex row align style={{ justifyContent: 'space-between' }}>
        <Tooltip content={TOOLTIP_STRINGS.EDIT_FILE_TOOLTIP}>
          <IconButton $square icon="Edit" onClick={onFileEdit} disabled />
        </Tooltip>
        <Tooltip content={TOOLTIP_STRINGS.VIEW_FILE_TOOLTIP}>
          <IconButton $square icon="Eye" onClick={onFileView} disabled />
        </Tooltip>
        <Tooltip
          content={
            writeAccess
              ? TOOLTIP_STRINGS.CLEAR_TAGS_TOOLTIP
              : PERMISSIONS_STRINGS.FILES_WRITE_PERMISSIONS
          }
        >
          <IconButton
            $square
            icon="Trash"
            onClick={() => onClearAnnotations(row)}
            disabled={!writeAccess}
          />
        </Tooltip>
      </Flex>
    ),
  },
];

export default function LandingPage() {
  const [query, setQuery] = useState<string>('');

  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [loadChunk, setLoadChunk] = useState<number>(0);

  const { files, isLoading, total } = useAnnotatedFiles(
    shouldUpdate,
    loadChunk
  );

  const noFiles = !isLoading && total === 0;
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const client = useQueryClient();

  const writeAccess = filesAcl && eventsAcl;

  // Is there more ids to load?
  const isLoadMoreDisabled = () => total <= 1000 * (loadChunk + 1);

  const onFileEdit = (event: any) => {
    event.stopPropagation();
    // eslint-disable-next-line
    // TODO (CDF-11153)
  };
  const onFileView = (event: any) => {
    event.stopPropagation();
    // eslint-disable-next-line
    // TODO (CDF-11152)
  };

  const onDeleteSuccess = () => {
    const invalidate = () =>
      client.invalidateQueries(['cdf', 'events', 'list']);
    invalidate();
    // The sleep shouldn't be necessary, but await (POST /resource
    // {data}) && await(POST /resource/byids) might not return the
    // newly created item.
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(() => {
      invalidate();
      // Trigger files list to update
      setShouldUpdate(true);
    });

    notification.success({
      message: 'Annotation saved!',
    });
  };
  const onClearAnnotations = async (file: FileInfo) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: <span>{WARNINGS_STRINGS.CLEAR_ANNOTATIONS_WARNING}</span>,
      onOk: async () => {
        if (file) {
          // Make sure annotations are updated
          await deleteAnnotationsForFile(file.id, file.externalId);
          onDeleteSuccess();
        }
        return message.success(
          `Successfully cleared annotation for ${file!.name}`
        );
      },
      onCancel: () => {},
    });
  };

  const interactiveColumns = getColumns(
    onFileEdit,
    onFileView,
    onClearAnnotations,
    writeAccess
  );

  const showFilesList = noFiles ? (
    <EmptyFilesList />
  ) : (
    <>
      <FilterBar query={query} setQuery={setQuery} />
      <Table
        pagination={{
          pageSize: PAGE_SIZE,
          hideOnSinglePage: true,
        }}
        dataSource={files as FileInfo[]}
        // @ts-ignore
        columns={interactiveColumns}
        size="middle"
        rowKey="id"
        footer={() => (
          <Button
            disabled={isLoadMoreDisabled()}
            onClick={() => setLoadChunk(loadChunk + 1)}
          >
            Load more
          </Button>
        )}
        // onRow={(record: any) => ({
        //   onClick: () => alert(record),
        // })}
      />
    </>
  );

  return (
    <div>
      <PageTitle>Interactive Engineering Diagrams</PageTitle>
      {isLoading ? (
        <Flex style={{ height: '50vh' }}>
          <Loader />
        </Flex>
      ) : (
        showFilesList
      )}
    </div>
  );
}

function EmptyFilesList() {
  const { tenant } = useParams<{ tenant: string }>();
  const history = useHistory();
  const dispatch = useDispatch();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.contextualization.start);
    const newWorkflowId = Number(new Date());
    dispatch(createNewWorkflow(newWorkflowId));
    history.push(diagramSelection.path(tenant, String(newWorkflowId)));
  };

  return (
    <Wrapper>
      <Graphic type="Documents" />
      <Title level={5} style={{ margin: '24px 0' }}>
        No files have been contextualized yet!
      </Title>
      <IconButton type="primary" icon="Document" onClick={onContextualizeNew}>
        Contextualize a new file
      </IconButton>
    </Wrapper>
  );
}
