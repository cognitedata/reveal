import React from 'react';
import { message, Modal, notification, Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import { usePermissions, useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { sleep } from 'utils/utils';
import { useQueryClient } from 'react-query';
import { deleteAnnotationsForFile } from 'utils/AnnotationUtils';
import {
  PERMISSIONS_STRINGS,
  WARNINGS_STRINGS,
  TOOLTIP_STRINGS,
} from 'stringConstants';

type Props = {
  id: ResourceItem['id'];
  setEditMode: (val: boolean) => void;
};
export const ClearTagsButton = (props: Props) => {
  const { id, setEditMode } = props;
  const client = useQueryClient();
  const { data: filesPermissions } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsPermissions } = usePermissions('eventsAcl', 'WRITE');

  const writeAccess = filesPermissions && eventsPermissions;

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
    if (!filesPermissions) {
      errors.push('files:write is missing');
    }
    if (!eventsPermissions) {
      errors.push('events:write is missing');
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
    <Tooltip
      title={
        eventsPermissions
          ? TOOLTIP_STRINGS.CLEAR_TAGS_TOOLTIP
          : TOOLTIP_STRINGS.CANNOT_CLEAR_TAGS_TOOLTIP
      }
    >
      <Button
        icon="DeleteAlt"
        key={id}
        onClick={onDeleteClick}
        disabled={!eventsPermissions}
      />
    </Tooltip>
  );
};
