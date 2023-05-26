import React from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
export const EditFileButton = ({
  item: { id, type },
  onClick,
  isActive,
  filesAcl,
  annotationsAcl,
}: {
  item: ResourceItem;
  onClick: () => void;
  isActive: boolean;
  filesAcl: boolean;
  annotationsAcl: boolean;
}) => {
  if (type !== 'file') {
    return null;
  }
  const writeAccess = filesAcl && annotationsAcl;
  const errors: string[] = [];

  if (!filesAcl) {
    errors.push('files:write is missing');
  }
  if (!annotationsAcl) {
    errors.push('annotations:write is missing');
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
        both annotations:write and files:write capabilities.
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
