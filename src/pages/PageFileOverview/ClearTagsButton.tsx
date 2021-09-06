import React from 'react';
import { message, Modal, notification } from 'antd';
import { Button } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { sleep } from 'utils/utils';
import { useQueryClient } from 'react-query';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { WARNINGS_STRINGS } from 'stringConstants';
import { useReviewFiles } from 'hooks';

type Props = {
  id: ResourceItem['id'];
  setEditMode: (val: boolean) => void;
};
export const ClearTagsButton = (props: Props) => {
  const { id, setEditMode } = props;
  const client = useQueryClient();
  const { onClearFileTags } = useReviewFiles([id]);
  const onDeleteSuccess = () => {
    trackUsage(PNID_METRICS.fileViewer.deleteAnnotations, {
      fileId: id,
    });
    const invalidate = () =>
      client.invalidateQueries(['cdf', 'events', 'list']);
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

  const { data: fileInfo } = useCdfItem<FileInfo>('files', {
    id: Number(id!),
  });

  const onDeleteClick = () =>
    Modal.confirm({
      title: 'Are you sure?',
      content: <span>{WARNINGS_STRINGS.CLEAR_ANNOTATIONS_WARNING}</span>,
      onOk: async () => {
        setEditMode(false);
        if (fileInfo) {
          // Make sure annotations are updated
          await deleteAnnotationsForFile(fileInfo.id, fileInfo.externalId);
          await onClearFileTags(fileInfo.id);
          onDeleteSuccess();
        }
        return message.success(
          `Successfully cleared annotation for ${fileInfo!.name}`
        );
      },
      onCancel: () => {},
    });

  return (
    <Button
      aria-label="Button-Clear-Tags"
      icon="Trash"
      key={id}
      onClick={onDeleteClick}
    />
  );
};
