import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';
import { getFlow } from '@cognite/cdf-sdk-singleton';

export const EditFileButton = ({
  item: { id, type },
  onClick,
  isActive,
}: {
  item: ResourceItem;
  onClick: () => void;
  isActive: boolean;
}) => {
  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow as any, 'filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions(flow as any, 'eventsAcl', 'WRITE');
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
        content={
          <>
            <p>
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button icon="Edit" aria-label="Edit" disabled />
      </Tooltip>
    );
  }
  if (isActive) {
    return (
      <Button
        type="primary"
        icon="Edit"
        key={id}
        onClick={onClick}
        style={{ whiteSpace: 'nowrap' }}
      >
        Done editing
      </Button>
    );
  }

  return (
    <Tooltip content="Edit">
      <Button icon="Edit" aria-label="edit" key={id} onClick={onClick} />
    </Tooltip>
  );
};
