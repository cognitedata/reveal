import React from 'react';

import { Tooltip } from 'antd';

import { Button } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

export const EditFileButton = ({
  item: { id, type },
  onClick,
  isActive,
}: {
  item: ResourceItem;
  onClick: () => void;
  isActive: boolean;
}) => {
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  // TODO: remove events:write once the migration to Annotations API is completed
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const { data: annotationsAcl } = usePermissions('annotationsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl && annotationsAcl;

  if (type !== 'file') {
    return null;
  }

  if (!writeAccess) {
    const errors: string[] = [];
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
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button icon="Edit" aria-label="Button-Edit" disabled />
      </Tooltip>
    );
  }
  if (isActive) {
    return (
      <Button
        type="primary"
        icon="Edit"
        aria-label="Button-Edit"
        key={id}
        onClick={onClick}
        style={{ whiteSpace: 'nowrap' }}
      >
        Leave edit mode
      </Button>
    );
  }

  return (
    <Tooltip title="Edit">
      <Button icon="Edit" key={id} onClick={onClick} aria-label="Button-Edit" />
    </Tooltip>
  );
};
