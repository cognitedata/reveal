import React from 'react';
import { message, Modal, notification, Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import { usePermissions, useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem, useAnnotations } from '@cognite/data-exploration';
import sdk from 'sdk-singleton';

import { FileInfo } from '@cognite/sdk';
import {
  CogniteAnnotation,
  convertEventsToAnnotations,
  hardDeleteAnnotations,
} from '@cognite/annotations';
import { sleep } from 'utils/utils';
import { useQueryClient, useMutation } from 'react-query';

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

  const onSuccess = () => {
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

  const persistedAnnotations = useAnnotations(id);

  const { mutate: deleteAnnotations } = useMutation(
    (annotations: CogniteAnnotation[]) =>
      hardDeleteAnnotations(sdk, annotations),
    {
      onSuccess,
    }
  );

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
            <p>
              You do not have the necessary permissions to clear tags on this
              file. You need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button icon="Close" disabled />
      </Tooltip>
    );
  }

  const onClick = () =>
    Modal.confirm({
      title: 'Are you sure?',
      content: (
        <span>
          All annotations will be deleted . However, you can always
          re-contextualize the file.
        </span>
      ),
      onOk: async () => {
        setEditMode(false);
        if (fileInfo) {
          // Make sure annotations are updated
          deleteAnnotations(
            convertEventsToAnnotations(persistedAnnotations.data)
          );
        }
        return message.success(
          `Successfully cleared annotation for ${fileInfo!.name}`
        );
      },
      onCancel: () => {},
    });

  return (
    <Tooltip title="Clear tags">
      <Button icon="DeleteAlt" key={id} onClick={onClick} />
    </Tooltip>
  );
};
