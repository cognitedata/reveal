import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
export const EditFileButton = ({
  item: { id, type },
  onClick,
  isActive,
  filesAcl,
  eventsAcl,
}: {
  item: ResourceItem;
  onClick: () => void;
  isActive: boolean;
  filesAcl: boolean;
  eventsAcl: boolean;
}) => {
  if (type !== 'file') {
    return null;
  }
  const writeAccess = filesAcl && eventsAcl;
  const errors: string[] = [];

  if (!filesAcl) {
    errors.push('files:write is missing');
  }
  if (!eventsAcl) {
    errors.push('event:write is missing');
  }

  if (isActive) {
    return null;
  }
  const tooltipContent = writeAccess ? (
    'Edit'
  ) : (
    <>
      <p>
        You do not have the necessary permissions to edit this file. You need
        both events:write and files:write capabilities.
      </p>
      <p>Errors: {errors.join(' and ')}.</p>
    </>
  );

  return (
    <Tooltip content={tooltipContent}>
      <Button
        icon="Edit"
        aria-label="edit"
        type="ghost"
        key={id}
        onClick={onClick}
        disabled={writeAccess ? false : true}
      />
    </Tooltip>
  );
};
