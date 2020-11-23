import React from 'react';
import { Tooltip } from 'antd';
import { Button } from '@cognite/cogs.js';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { ResourceItem } from 'lib/types';

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
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  if (type !== 'file') {
    return null;
  }

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
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button variant="outline" icon="Edit" disabled />
      </Tooltip>
    );
  }
  if (isActive) {
    return (
      <Button type="primary" icon="Edit" key={id} onClick={onClick}>
        Done Editing
      </Button>
    );
  }

  return <Button variant="outline" icon="Edit" key={id} onClick={onClick} />;
};
