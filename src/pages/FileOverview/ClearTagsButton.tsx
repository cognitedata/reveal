import React from 'react';
import { message, Modal, Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import { usePermissions, useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';
import { useDispatch } from 'react-redux';
import { hardDeleteAnnotationsForFile } from 'modules/annotations';

import { FileInfo } from '@cognite/sdk';

export const ClearTagsButton = ({
  id,
  setEditMode,
}: {
  id: ResourceItem['id'];
  setEditMode: (val: boolean) => void;
}) => {
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;
  const dispatch = useDispatch();

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
          await dispatch(
            hardDeleteAnnotationsForFile.action({ file: fileInfo })
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
