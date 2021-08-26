import React from 'react';
import { useQueryClient } from 'react-query';
import { createLink } from '@cognite/cdf-utilities';
import { FileInfo } from '@cognite/sdk';
import { message, Modal, notification } from 'antd';
import { WARNINGS_STRINGS } from 'stringConstants';
import { FileWithAnnotations } from 'hooks';
import { useWorkflowCreateNew } from 'modules/workflows';
import { stringContains } from 'modules/contextualization/utils';
import { sleep } from 'utils/utils';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { Table } from 'components/Common';
import { useReviewFiles } from 'hooks/useReviewFiles';
import { getColumns } from './columns';

const PAGE_SIZE = 10;

type Props = {
  query: string;
  files?: FileWithAnnotations[];
};

export default function FilesList(props: Props) {
  const { query, files } = props;

  const { onApproved, onRejected, onClearFileTags } = useReviewFiles(
    files?.map((file) => file.id) ?? []
  );
  const client = useQueryClient();
  const { createWorkflow } = useWorkflowCreateNew();

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
          await onClearFileTags(file.id);
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
      client.invalidateQueries([
        'sdk-react-query-hooks',
        'cdf',
        'events',
        'list',
      ]);
    invalidate();
    // The sleep shouldn't be necessary, but await (POST /resource
    // {data}) && await(POST /resource/byids) might not return the
    // newly created item.
    sleep(500).then(invalidate);
    sleep(1500).then(invalidate);
    sleep(5000).then(invalidate);

    notification.success({
      message: 'Annotation saved!',
    });
  };

  const onFileEdit = (file: FileInfo): void => {
    const diagramToContextualize = {
      type: 'files',
      endpoint: 'retrieve',
      filter: [{ id: file.id }],
    };
    trackUsage(PNID_METRICS.landingPage.editFile, {
      fileId: file.id,
    });
    createWorkflow({ diagrams: diagramToContextualize });
  };
  const onFileView = (file: FileInfo): void => {
    const fileId = file.id ?? file.externalId;
    trackUsage(PNID_METRICS.landingPage.viewFile, {
      fileId,
    });
    window.open(createLink(`/explore/file/${fileId}`), '_blank');
  };

  const onApproveFile = (file: FileInfo): void => {
    onApproved([file.id]);
  };

  const onRejectFile = (file: FileInfo): void => {
    onRejected([file.id]);
  };

  const interactiveColumns = getColumns(
    onFileEdit,
    onFileView,
    onClearAnnotations,
    onApproveFile,
    onRejectFile
  );

  const handleSearchFiles = () => {
    if (query.trim()?.length) {
      trackUsage(PNID_METRICS.landingPage.useSearch);
      return (files ?? []).filter((file) =>
        stringContains(file.name, query)
      ) as FileInfo[];
    }
    return files as FileInfo[];
  };

  return (
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
      locale={{
        emptyText: 'No pending engineering diagrams were found.',
      }}
    />
  );
}
