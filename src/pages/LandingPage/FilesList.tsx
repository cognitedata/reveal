import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQueryClient } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Button, Tooltip, Icon, Body } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { message, Modal, notification } from 'antd';
import { FileInfo } from 'cognite-sdk-v3';
import { Flex, Table } from 'components/Common';
import { sleep } from 'utils/utils';
import { useAnnotatedFiles } from 'hooks';
import { WARNINGS_STRINGS, TOOLTIP_STRINGS } from 'stringConstants';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import { createNewWorkflow } from 'modules/workflows';
import { diagramSelection } from 'routes/paths';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { stringContains } from 'modules/contextualization/utils';
import FilterBar from './FilterBar';
import FilesListEmpty from './FilesListEmpty';
import { getColumns } from './columns';

const PAGE_SIZE = 10;

type FilesListProps = {
  shouldUpdate: boolean;
  loadChunk: number;
  setShouldUpdate: (shouldUpdate: boolean) => void;
  setLoadChunk: (loadChunk: number) => void;
};

export default function FilesList(props: FilesListProps) {
  const { shouldUpdate, loadChunk, setShouldUpdate, setLoadChunk } = props;
  const { tenant } = useParams<{ tenant: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const [query, setQuery] = useState<string>('');
  const [hidePanel, setHidePanel] = useState<boolean>(false);
  const client = useQueryClient();
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const { files, isLoading, total } = useAnnotatedFiles(
    shouldUpdate,
    loadChunk
  );

  const writeAccess = filesAcl && eventsAcl;
  const noFiles = !isLoading && total === 0;

  const isLoadMoreDisabled = total <= 1000 * (loadChunk + 1);

  const onClearAnnotations = async (file: FileInfo): Promise<void> => {
    trackUsage(PNID_METRICS.landingPage.deleteAnnotations, {
      fileId: file.id,
    });

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
  const onDeleteSuccess = (): void => {
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
  const onFileEdit = (file: FileInfo): void => {
    const newWorkflowId = Number(new Date());
    const diagramToContextualize = {
      type: 'files',
      endpoint: 'retrieve',
      filter: [{ id: file.id }],
    };
    dispatch(
      createNewWorkflow({
        workflowId: newWorkflowId,
        diagrams: diagramToContextualize,
      })
    );
    trackUsage(PNID_METRICS.landingPage.editFile, {
      fileId: file.id,
    });
    history.push(diagramSelection.path(tenant, String(newWorkflowId)));
  };
  const onFileView = (file: FileInfo): void => {
    const fileId = file.id ?? file.externalId;
    trackUsage(PNID_METRICS.landingPage.viewFile, {
      fileId,
    });
    window.open(createLink(`/explore/file/${fileId}`), '_blank');
  };

  const interactiveColumns = getColumns(
    onFileEdit,
    onFileView,
    onClearAnnotations,
    writeAccess
  );

  const LoadMorePanel = () => {
    const onClickLoadMore = () => {
      trackUsage(PNID_METRICS.landingPage.loadMore, {
        chunk: loadChunk + 1,
      });
      setLoadChunk(loadChunk + 1);
    };
    const canLoadMore = total > files.length && !hidePanel;
    if (canLoadMore) {
      return (
        <Flex
          row
          style={{
            background: isLoadMoreDisabled ? '#F5F5F5' : '#4A67FB',
            padding: '4px 4px 4px 12px',
            borderRadius: '6px',
            justifyContent: 'space-between',
          }}
        >
          <Body level={2} style={{ marginRight: '5px' }}>
            <b>{files.length}</b> files loaded.
          </Body>
          {isLoadMoreDisabled ? (
            <>
              <Body level={2} style={{ marginRight: '5px', color: '#8C8C8C' }}>
                All files are loaded{' '}
              </Body>
              <Tooltip content="Hide">
                <Icon
                  type="Close"
                  style={{ verticalAlign: '-0.225em' }}
                  onClick={() => setHidePanel(true)}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Button onClick={onClickLoadMore}>Load more</Button>
              <Tooltip content={TOOLTIP_STRINGS.LOAD_MORE_FILES_TOOLTIP}>
                <Icon type="Info" style={{ verticalAlign: '-0.225em' }} />
              </Tooltip>
            </>
          )}
        </Flex>
      );
    }
    return <span />;
  };

  const handleSearchFiles = () => {
    if (query.trim().length) {
      trackUsage(PNID_METRICS.landingPage.useSearch);
      return files.filter((file) =>
        stringContains(file.name, query)
      ) as FileInfo[];
    }
    return files as FileInfo[];
  };

  if (noFiles) return <FilesListEmpty />;
  return (
    <>
      <FilterBar
        query={query}
        setQuery={setQuery}
        LoadMorePanel={LoadMorePanel}
      />
      <Table
        pagination={{
          pageSize: PAGE_SIZE,
          hideOnSinglePage: true,
        }}
        dataSource={handleSearchFiles()}
        // @ts-ignore
        columns={interactiveColumns}
        size="middle"
        rowKey="id"
      />
    </>
  );
}
