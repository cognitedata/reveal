import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { message, Modal, notification } from 'antd';
import { FileInfo } from 'cognite-sdk-v3';
import { Table } from 'components/Common';
import { sleep } from 'utils/utils';
import { useAnnotatedFiles } from 'hooks';
import { WARNINGS_STRINGS } from 'stringConstants';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
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
  const history = useHistory();
  const [query, setQuery] = useState<string>('');
  const client = useQueryClient();
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const { files, isLoading, total } = useAnnotatedFiles(
    shouldUpdate,
    loadChunk
  );

  const writeAccess = filesAcl && eventsAcl;
  const noFiles = !isLoading && total === 0;
  const isLoadMoreDisabled = () => total <= 1000 * (loadChunk + 1);

  const onClearAnnotations = async (file: FileInfo): Promise<void> => {
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
  const onFileEdit = (_file: FileInfo): void => {
    // eslint-disable-next-line
    // TODO (CDF-11153)
  };
  const onFileView = (file: FileInfo): void => {
    const fileId = file.id ?? file.externalId;
    history.push(createLink(`/explore/file/${fileId}`));
  };

  const interactiveColumns = getColumns(
    onFileEdit,
    onFileView,
    onClearAnnotations,
    writeAccess
  );

  if (noFiles) return <FilesListEmpty />;
  return (
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
      />
    </>
  );
}
