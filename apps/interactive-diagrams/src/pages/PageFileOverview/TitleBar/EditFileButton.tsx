import React from 'react';
import { Tooltip } from 'antd';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from '@cognite/data-exploration';

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
  const { data: filesAcl } = usePermissions(flow, 'filesAcl', 'WRITE');
  // TODO: remove events:write once the migration to Annotations API is completed
  const { data: eventsAcl } = usePermissions(flow, 'eventsAcl', 'WRITE');
  const { data: annotationsAcl } = usePermissions(
    flow,
    'annotationsAcl',
    'WRITE'
  );
  const writeAccess = filesAcl && eventsAcl && annotationsAcl;

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
