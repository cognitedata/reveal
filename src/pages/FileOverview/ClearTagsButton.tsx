import React from 'react';
import { message, Modal, notification, Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import { usePermissions, useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { sleep } from 'utils/utils';
import { useQueryClient } from 'react-query';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import { PERMISSIONS_STRINGS, WARNINGS_STRINGS } from 'stringConstants';

export const ClearTagsButton = ({
  id,
  setEditMode,
}: {
  id: ResourceItem['id'];
  setEditMode: (val: boolean) => void;
}) => {
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const client = useQueryClient();

  const writeAccess = filesAcl && eventsAcl;

  const onDeleteSuccess = () => {
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

  if (!writeAccess) {
    const errors = [];
    if (!filesAcl) {
      errors.push('files:write is missing');
    }
    if (!eventsAcl) {
      errors.push('event:write is missing');
    }
    return (
      <Tooltip
        placement="bottom"
        title={
          <>
            <p>{PERMISSIONS_STRINGS.FILES_WRITE_PERMISSIONS}</p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button icon="Close" disabled />
      </Tooltip>
    );
  }

  const onDeleteClick = () =>
    Modal.confirm({
      title: 'Are you sure?',
      content: <span>{WARNINGS_STRINGS.CLEAR_ANNOTATIONS_WARNING}</span>,
      onOk: async () => {
        setEditMode(false);
        if (fileInfo) {
          // Make sure annotations are updated
          await deleteAnnotationsForFile(fileInfo.id, fileInfo.externalId);
          onDeleteSuccess();
        }
        return message.success(
          `Successfully cleared annotation for ${fileInfo!.name}`
        );
      },
      onCancel: () => {},
    });

  return (
    <Tooltip title="Clear tags">
      <Button icon="DeleteAlt" key={id} onClick={onDeleteClick} />
    </Tooltip>
  );
};
